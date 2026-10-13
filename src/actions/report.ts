"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  failure,
  invalidInput,
  success,
  type ActionState,
} from "@/lib/action-state";
import { requireOnboardedProfile } from "@/lib/auth";
import {
  deleteAsset,
  deleteOwnedAsset,
  verifyUploadedImage,
} from "@/lib/cloudinary";
import {
  listReports,
  reportCursorSchema,
  type ReportPage,
} from "@/lib/reports";
import { createClient } from "@/lib/supabase/server";
import { reportFiltersSchema, reportSchema } from "@/lib/validations/report";

function readImageField(value: FormDataEntryValue | null): unknown {
  if (typeof value !== "string" || value.length === 0) return undefined;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export async function createReportAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireOnboardedProfile();

  const image = readImageField(formData.get("image"));
  if (image === null) return failure("That upload could not be read.");

  const parsed = reportSchema.safeParse({
    type: formData.get("type"),
    species: formData.get("species"),
    title: formData.get("title"),
    description: formData.get("description"),
    city: formData.get("city"),
    locality: formData.get("locality"),
    lastSeenAt: formData.get("lastSeenAt"),
    contactNote: formData.get("contactNote"),
    petId: formData.get("petId"),
    image,
  });

  if (!parsed.success) return invalidInput(parsed.error);

  let imageUrl: string | null = null;

  if (parsed.data.image) {
    const asset = await verifyUploadedImage(
      parsed.data.image.publicId,
      "report",
      profile.id,
    );

    if (!asset.ok) {
      await deleteOwnedAsset(parsed.data.image.publicId, "report", profile.id);
      return failure(asset.reason);
    }

    imageUrl = asset.url;
  }

  const supabase = await createClient();

  // The insert policy rejects a pet_id the reporter does not own, so a forged
  // value fails in the database rather than being filtered here.
  const { data, error } = await supabase
    .from("lost_found_reports")
    .insert({
      reporter_id: profile.id,
      pet_id: parsed.data.petId ?? null,
      type: parsed.data.type,
      species: parsed.data.species,
      title: parsed.data.title,
      description: parsed.data.description,
      city: parsed.data.city,
      locality: parsed.data.locality,
      last_seen_at: new Date(parsed.data.lastSeenAt).toISOString(),
      contact_note: parsed.data.contactNote ?? null,
      image_url: imageUrl,
      image_public_id: parsed.data.image?.publicId ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    await deleteOwnedAsset(
      parsed.data.image?.publicId ?? null,
      "report",
      profile.id,
    );
    console.error("Failed to create report", error);
    return failure("We could not publish that report. Please try again.");
  }

  revalidatePath("/lost-found");
  redirect(`/lost-found/${data.id}`);
}

export async function markReunitedAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireOnboardedProfile();

  const reportId = formData.get("reportId");
  if (typeof reportId !== "string" || !reportId) {
    return failure("That report could not be identified.");
  }

  const supabase = await createClient();

  // status and reunited_at move together — a check constraint enforces that
  // they can never disagree.
  const { data, error } = await supabase
    .from("lost_found_reports")
    .update({ status: "reunited", reunited_at: new Date().toISOString() })
    .eq("id", reportId)
    .eq("reporter_id", profile.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to mark report reunited", error);
    return failure("We could not update that report.");
  }

  if (!data) return failure("That report no longer exists.");

  revalidatePath("/lost-found");
  revalidatePath(`/lost-found/${reportId}`);

  return success("Marked as reunited.");
}

export async function reopenReportAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireOnboardedProfile();

  const reportId = formData.get("reportId");
  if (typeof reportId !== "string" || !reportId) {
    return failure("That report could not be identified.");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lost_found_reports")
    .update({ status: "open", reunited_at: null })
    .eq("id", reportId)
    .eq("reporter_id", profile.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to reopen report", error);
    return failure("We could not update that report.");
  }

  if (!data) return failure("That report no longer exists.");

  revalidatePath("/lost-found");
  revalidatePath(`/lost-found/${reportId}`);

  return success("Report reopened.");
}

export async function deleteReportAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireOnboardedProfile();

  const reportId = formData.get("reportId");
  if (typeof reportId !== "string" || !reportId) {
    return failure("That report could not be identified.");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lost_found_reports")
    .delete()
    .eq("id", reportId)
    .eq("reporter_id", profile.id)
    .select("image_public_id")
    .maybeSingle();

  if (error) {
    console.error("Failed to delete report", error);
    return failure("We could not delete that report.");
  }

  if (!data) return failure("That report no longer exists.");

  await deleteAsset(data.image_public_id);

  revalidatePath("/lost-found");
  redirect("/lost-found");
}

/** "Load more" for the board, with the active filters re-validated server-side. */
export async function loadMoreReportsAction(
  rawFilters: unknown,
  rawCursor: unknown,
): Promise<ReportPage> {
  const filters = reportFiltersSchema.safeParse(rawFilters);
  const cursor = reportCursorSchema.safeParse(rawCursor);

  if (!filters.success || !cursor.success) {
    return { reports: [], nextCursor: null };
  }

  return listReports(filters.data, cursor.data);
}
