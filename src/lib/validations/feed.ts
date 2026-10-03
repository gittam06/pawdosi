import { z } from "zod";

/**
 * Which list "load more" is paging through.
 *
 * This lives outside the Server Action module on purpose: a `"use server"`
 * file may only export async functions, so exporting the schema object from
 * there breaks every page that imports it — at module evaluation, with an
 * error that points at the import rather than the cause.
 */
export const feedScopeSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("explore") }),
  z.object({ type: z.literal("feed") }),
  z.object({ type: z.literal("pet"), petId: z.uuid() }),
]);

export type FeedScope = z.infer<typeof feedScopeSchema>;
