"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";

import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SPECIES } from "@/config/pets";
import { STATUS_ALL, type ReportFilters } from "@/lib/validations/report";

const ANY = "any";

const TYPES = [
  { value: undefined, label: "All" },
  { value: "lost", label: "Lost" },
  { value: "found", label: "Found" },
] as const;

/**
 * "All" carries an explicit value: an absent `status` param means "open", so
 * the two cannot be expressed by the same empty state.
 */
const STATUSES = [
  { value: "open", label: "Open" },
  { value: "reunited", label: "Reunited" },
  { value: STATUS_ALL, label: "All" },
] as const;

/**
 * Filters live in the query string, not in component state: the server does
 * the filtering, and a filtered board is a URL somebody can share into a
 * neighbourhood group — which is the whole point of this feature.
 */
export function ReportFiltersBar({ filters }: { filters: ReportFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [city, setCity] = useState(filters.city ?? "");

  function apply(changes: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }

    // A new filter set is a new first page.
    const query = next.toString();
    startTransition(() =>
      router.push(query ? `${pathname}?${query}` : pathname),
    );
  }

  const hasFilters =
    Boolean(filters.city) ||
    Boolean(filters.species) ||
    Boolean(filters.type) ||
    filters.status !== "open";

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card/60 p-4">
      <div className="flex flex-wrap items-end gap-4">
        <ToggleGroup
          label="Type"
          options={TYPES}
          active={filters.type}
          onSelect={(value) => apply({ type: value })}
        />

        <ToggleGroup
          label="Status"
          options={STATUSES}
          active={filters.status ?? STATUS_ALL}
          onSelect={(value) => apply({ status: value })}
        />

        <div className="space-y-1.5">
          <Label htmlFor="species-filter">Species</Label>
          <Select
            value={filters.species ?? ANY}
            onValueChange={(value) =>
              apply({ species: value === ANY ? undefined : value })
            }
          >
            <SelectTrigger id="species-filter" className="h-9 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any species</SelectItem>
              {SPECIES.map((species) => (
                <SelectItem key={species.value} value={species.value}>
                  {species.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <form
          className="flex items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            apply({ city: city.trim() || undefined });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="city-filter">City</Label>
            <Input
              id="city-filter"
              name="city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Bengaluru"
              className="h-9 w-44"
            />
          </div>
          <Button type="submit" variant="outline" size="lg" className="h-9">
            {isPending ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <Search aria-hidden />
            )}
            <span className="sr-only">Filter by city</span>
          </Button>
        </form>
      </div>

      {hasFilters ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setCity("");
            startTransition(() => router.push(pathname));
          }}
        >
          <X aria-hidden />
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}

type ToggleOption = { value: string | undefined; label: string };

function ToggleGroup({
  label,
  options,
  active,
  onSelect,
}: {
  label: string;
  options: readonly ToggleOption[];
  active: string | undefined;
  onSelect: (value: string | undefined) => void;
}) {
  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium">{label}</span>
      <div
        role="group"
        aria-label={label}
        className="inline-flex rounded-lg border border-border bg-background p-0.5"
      >
        {options.map((option) => {
          const isActive = active === option.value;

          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(option.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors outline-none",
                "focus-visible:ring-3 focus-visible:ring-ring/50",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
