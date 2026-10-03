import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Siren } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { ReportFiltersBar } from "@/components/reports/report-filters";
import { ReportList } from "@/components/reports/report-list";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { countReports, listReports } from "@/lib/reports";
import { parseReportFilters } from "@/lib/validations/report";

export const metadata: Metadata = {
  title: "Lost & Found",
  description:
    "Lost and found pets in your neighbourhood. Report a missing pet, or help reunite one you have found.",
};

export const dynamic = "force-dynamic";

type LostFoundPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LostFoundPage({
  searchParams,
}: LostFoundPageProps) {
  // parseReportFilters applies the "open by default" rule, so the page does
  // not need to second-guess it.
  const filters = parseReportFilters(await searchParams);

  const [{ reports, nextCursor }, matchCount, user] = await Promise.all([
    listReports(filters, null),
    countReports(filters),
    getCurrentUser(),
  ]);

  const noun = matchCount === 1 ? "report" : "reports";
  const scope =
    filters.status === "open"
      ? `open ${noun}`
      : filters.status === "reunited"
        ? `reunited ${noun}`
        : noun;

  return (
    <div className="mx-auto w-full max-w-page px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-bold">Lost &amp; Found</h1>
          <p className="text-sm text-muted-foreground">
            {matchCount === 0
              ? `Nothing matching right now.`
              : `${matchCount} ${scope}${filters.city ? ` in ${filters.city}` : ""}.`}
          </p>
        </div>

        <Button asChild className="h-10">
          <Link
            href={
              user ? "/lost-found/new" : "/sign-in?next=%2Flost-found%2Fnew"
            }
          >
            <Plus aria-hidden />
            File a report
          </Link>
        </Button>
      </header>

      <div className="space-y-6">
        <ReportFiltersBar filters={filters} />

        {reports.length === 0 ? (
          <EmptyState
            icon={Siren}
            title="Nothing matches those filters"
            description="Try a wider search — or if a pet near you is missing, file the first report."
            action={
              <Button variant="outline" asChild className="mt-1 h-10">
                <Link href="/lost-found">Clear filters</Link>
              </Button>
            }
          />
        ) : (
          <ReportList
            filters={filters}
            initialReports={reports}
            initialCursor={nextCursor}
          />
        )}
      </div>
    </div>
  );
}
