"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { cn } from "cn";
import { Input } from "@/components/ui/input";

/**
 * Submits to /search rather than filtering in place: results are a page you
 * can link to, and the server does the query.
 *
 * The id comes from `useId()` because this renders more than once per page —
 * the header carries one and /search carries another. A hardcoded id made both
 * `<label for>` attributes point at whichever input came first in the DOM, so
 * the search page's own box had no accessible name at all.
 */
export function PetSearch({ className }: { className?: string }) {
  const router = useRouter();
  const inputId = useId();
  const [query, setQuery] = useState("");

  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(event) => {
        event.preventDefault();
        const term = query.trim();
        if (term.length >= 2)
          router.push(`/search?q=${encodeURIComponent(term)}`);
      }}
    >
      <label htmlFor={inputId} className="sr-only">
        Search pets
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        id={inputId}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search pets"
        className="h-9 w-44 pl-8 lg:w-56"
      />
    </form>
  );
}
