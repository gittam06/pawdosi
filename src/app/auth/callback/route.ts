import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

/**
 * Lands here from a confirmation email or an OAuth provider.
 *
 * Two shapes are supported:
 *  - `?code=…`        the PKCE flow used by @supabase/ssr and OAuth
 *  - `?token_hash=…&type=…`  what you get after customising the email template
 *
 * Supporting both means a changed email template cannot silently break signup.
 */

function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/onboarding";
  }

  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));

  // Behind Vercel's proxy the request origin is internal; the forwarded host
  // is the one the user actually typed.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : url.origin;

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error("Failed to exchange auth code", error);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error("Failed to verify email token", error);
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
