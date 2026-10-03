"use client";

import { useActionState } from "react";

import { signInWithGoogleAction } from "@/actions/auth";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { idleState } from "@/lib/action-state";

/** Rendered only when NEXT_PUBLIC_ENABLE_GOOGLE_AUTH is on. */
export function GoogleSignInButton({ next }: { next?: string }) {
  const [state, formAction] = useActionState(signInWithGoogleAction, idleState);

  return (
    <form action={formAction} className="space-y-3">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <SubmitButton
        variant="outline"
        size="lg"
        className="h-10 w-full"
        pendingLabel="Redirecting…"
      >
        <GoogleMark />
        Continue with Google
      </SubmitButton>
      <FormAlert state={state} />
    </form>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-4" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h11.8c-.5 2.8-2 5.1-4.4 6.7v5.6h7.1c4.2-3.8 6.6-9.5 6.6-16.5z"
      />
      <path
        fill="#34A853"
        d="M24 46c6 0 11-2 14.5-5.4l-7.1-5.6c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.8C8 41 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.8 28.1c-.4-1.3-.7-2.7-.7-4.1s.3-2.8.7-4.1v-5.8H4.5A22 22 0 0 0 2 24c0 3.6.9 6.9 2.5 9.9l7.3-5.8z"
      />
      <path
        fill="#EA4335"
        d="M24 10.5c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 3.9 30 2 24 2 15.4 2 8 7 4.5 14.1l7.3 5.8c1.7-5.2 6.5-9.4 12.2-9.4z"
      />
    </svg>
  );
}
