"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * Share sheet on phones, clipboard everywhere else.
 *
 * The URL is built from `location.href` at click time rather than passed in,
 * so it is always the canonical link the visitor is actually looking at.
 */
export function ShareButton({
  title,
  text,
  label = "Share",
}: {
  title: string;
  text?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        // AbortError just means the user dismissed the sheet.
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the link.");
    }
  }

  return (
    <Button type="button" variant="outline" size="lg" onClick={share}>
      {copied ? <Check aria-hidden /> : <Share2 aria-hidden />}
      {copied ? "Copied" : label}
    </Button>
  );
}
