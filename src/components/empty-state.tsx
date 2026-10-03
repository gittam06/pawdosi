import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "cn";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  /** The action that fills this space, if there is one. */
  action?: ReactNode;
  className?: string;
};

/**
 * The shared "nothing here yet" panel. An empty view always says what will
 * appear here and, where possible, offers the action that makes it appear.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-card/50 px-6 py-12 text-center",
        className,
      )}
    >
      <span
        className="flex size-12 items-center justify-center rounded-2xl bg-primary-muted text-primary-muted-foreground"
        aria-hidden
      >
        <Icon className="size-6" />
      </span>
      <div className="space-y-1">
        <h2 className="font-heading text-lg font-bold">{title}</h2>
        <p className="mx-auto max-w-sm text-sm text-pretty text-muted-foreground">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
