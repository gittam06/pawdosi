import { HeartHandshake, Search, Siren } from "lucide-react";

import { cn } from "cn";
import type { ReportStatus, ReportType } from "@/lib/types";

/**
 * Three states, three meanings:
 *
 * - open + lost  → `alert`. Someone's pet is missing right now.
 * - open + found → `teal`. Informational, not urgent for the reader.
 * - reunited     → `success`. Worth celebrating, regardless of type.
 *
 * Each carries an icon and a word, so the status never rests on colour alone.
 */
export function ReportStatusBadge({
  type,
  status,
  className,
}: {
  type: ReportType;
  status: ReportStatus;
  className?: string;
}) {
  if (status === "reunited") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-success-muted px-2.5 py-1 text-xs font-semibold text-success-muted-foreground",
          className,
        )}
      >
        <HeartHandshake className="size-3.5" aria-hidden />
        Reunited
      </span>
    );
  }

  if (type === "lost") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-alert px-2.5 py-1 text-xs font-semibold text-alert-foreground",
          className,
        )}
      >
        <Siren className="size-3.5" aria-hidden />
        Lost
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-teal-muted px-2.5 py-1 text-xs font-semibold text-teal-muted-foreground",
        className,
      )}
    >
      <Search className="size-3.5" aria-hidden />
      Found
    </span>
  );
}
