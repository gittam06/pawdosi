"use client";

import { useSyncExternalStore } from "react";

/** Nothing ever changes, so the subscription is a no-op. */
const subscribe = () => () => {};

/**
 * `false` during the server render and the hydration pass, `true` afterwards.
 *
 * For values that can only be right in the browser — anything derived from the
 * local clock or timezone. A `useState` initialiser is not one of those: it
 * runs on the *server* during SSR and is not re-run on the client, so a
 * "default to now" computed that way shows the server's wall clock (UTC on
 * Vercel) rather than the user's.
 *
 * Built on `useSyncExternalStore` rather than an effect for two reasons:
 * `getServerSnapshot` keeps the first client render byte-identical to the
 * server's, so there is no hydration mismatch, and nothing calls `setState`
 * from inside an effect — which `react-hooks/set-state-in-effect` rejects.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
