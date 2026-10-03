import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { ReportCursor, ReportWithReporter } from "@/lib/types";
import type { ReportFilters } from "@/lib/validations/report";

/**
 * Lost & Found reads. Same keyset pagination as the post feed, for the same
 * reason: the board changes while people are reading it.
 */

export const REPORTS_PAGE_SIZE = 12;

const REPORT_SELECT = `
  *,
  reporter:profiles!lost_found_reports_reporter_id_fkey(id, username, display_name, avatar_url),
  pet:pets!lost_found_reports_pet_id_fkey(id, name, slug)
`;

export const reportCursorSchema = z.object({
  createdAt: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "not a timestamp"),
  id: z.uuid(),
});

export type ReportPage = {
  reports: ReportWithReporter[];
  nextCursor: ReportCursor | null;
};

const EMPTY_PAGE: ReportPage = { reports: [], nextCursor: null };

export async function listReports(
  filters: ReportFilters,
  cursor: ReportCursor | null,
): Promise<ReportPage> {
  const supabase = await createClient();

  let query = supabase
    .from("lost_found_reports")
    .select(REPORT_SELECT)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(REPORTS_PAGE_SIZE + 1);

  // City is matched case-insensitively and loosely: people type "bengaluru",
  // "Bengaluru" and "Bangalore South" for the same place.
  if (filters.city) query = query.ilike("city", `%${filters.city}%`);
  if (filters.species) query = query.eq("species", filters.species);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.status) query = query.eq("status", filters.status);

  if (cursor) {
    query = query.or(
      `created_at.lt."${cursor.createdAt}",and(created_at.eq."${cursor.createdAt}",id.lt."${cursor.id}")`,
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load reports", error);
    return EMPTY_PAGE;
  }

  const rows = (data ?? []) as unknown as ReportWithReporter[];
  const hasMore = rows.length > REPORTS_PAGE_SIZE;
  const reports = hasMore ? rows.slice(0, REPORTS_PAGE_SIZE) : rows;
  const last = reports.at(-1);

  return {
    reports,
    nextCursor:
      hasMore && last ? { createdAt: last.created_at, id: last.id } : null,
  };
}

export async function getReportById(
  id: string,
): Promise<ReportWithReporter | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lost_found_reports")
    .select(REPORT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load report", error);
    return null;
  }

  return data ? (data as unknown as ReportWithReporter) : null;
}

/** How many reports match the current filters, for the board's header. */
export async function countReports(filters: ReportFilters): Promise<number> {
  const supabase = await createClient();

  let query = supabase
    .from("lost_found_reports")
    .select("id", { count: "exact", head: true });

  if (filters.city) query = query.ilike("city", `%${filters.city}%`);
  if (filters.species) query = query.eq("species", filters.species);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.status) query = query.eq("status", filters.status);

  const { count, error } = await query;

  if (error) {
    console.error("Failed to count reports", error);
    return 0;
  }

  return count ?? 0;
}
