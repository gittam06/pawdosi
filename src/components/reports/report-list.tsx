"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { loadMoreReportsAction } from "@/actions/report";
import { ReportCard } from "@/components/reports/report-card";
import { Button } from "@/components/ui/button";
import type { ReportCursor, ReportWithReporter } from "@/lib/types";
import type { ReportFilters } from "@/lib/validations/report";

type ReportListProps = {
  filters: ReportFilters;
  initialReports: ReportWithReporter[];
  initialCursor: ReportCursor | null;
};

export function ReportList({
  filters,
  initialReports,
  initialCursor,
}: ReportListProps) {
  const [reports, setReports] = useState(initialReports);
  const [cursor, setCursor] = useState(initialCursor);
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    if (!cursor) return;

    startTransition(async () => {
      const page = await loadMoreReportsAction(filters, cursor);

      if (page.reports.length === 0 && page.nextCursor === null) {
        setCursor(null);
        toast.error("Could not load more reports.");
        return;
      }

      setReports((current) => [...current, ...page.reports]);
      setCursor(page.nextCursor);
    });
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {reports.map((report) => (
          <li key={report.id}>
            <ReportCard report={report} />
          </li>
        ))}
      </ul>

      {cursor ? (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMore}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                Loading…
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
