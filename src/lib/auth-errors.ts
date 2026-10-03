import type { AuthError } from "@supabase/supabase-js";

/**
 * Turns a Supabase auth error into something a human can act on.
 *
 * Matching on `code` rather than the message means these survive upstream
 * copy changes. Anything unrecognised is logged and reported generically —
 * auth internals are not useful to the person at the keyboard.
 */
const MESSAGES: Record<string, string> = {
  invalid_credentials: "That email and password do not match.",
  email_not_confirmed:
    "Confirm your email first — check your inbox for the link.",
  user_already_exists:
    "An account with that email already exists. Sign in instead.",
  email_exists: "An account with that email already exists. Sign in instead.",
  weak_password: "That password is too weak. Try a longer one.",
  over_request_rate_limit: "Too many attempts. Try again in a few minutes.",
  over_email_send_rate_limit:
    "Too many emails sent. Wait a few minutes and try again.",
  same_password: "That is already your current password.",
  signup_disabled: "New signups are currently disabled.",
  validation_failed: "Check the details you entered and try again.",
};

export function authErrorMessage(error: AuthError): string {
  const known = error.code ? MESSAGES[error.code] : undefined;
  if (known) return known;

  console.error("Unmapped Supabase auth error", {
    code: error.code,
    status: error.status,
    message: error.message,
  });

  return "Something went wrong on our side. Please try again.";
}
