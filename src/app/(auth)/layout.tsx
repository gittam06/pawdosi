import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

/**
 * Shell for the signed-out auth screens. Anyone already signed in is sent
 * home — a signed-in user has no business on a sign-in page.
 */

// These screens branch on the session, so they must never be cached. Without
// this, a build run without Supabase credentials would prerender them as
// "signed out" and serve that snapshot to everyone.
export const dynamic = "force-dynamic";
export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
