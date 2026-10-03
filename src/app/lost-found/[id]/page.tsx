import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  HeartHandshake,
  MapPin,
  PawPrint,
} from "lucide-react";

import { CloudinaryImage } from "@/components/cloudinary-image";
import { SpeciesIcon } from "@/components/pets/species-icon";
import { ReportOwnerActions } from "@/components/reports/report-owner-actions";
import { ReportStatusBadge } from "@/components/reports/report-status-badge";
import { ShareButton } from "@/components/share-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import { speciesLabel } from "@/config/pets";
import { getCurrentUser } from "@/lib/auth";
import { cloudinaryTransform } from "@/lib/cloudinary-url";
import { absoluteTime, relativeTime } from "@/lib/relative-time";
import { getReportById } from "@/lib/reports";

type ReportPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: ReportPageProps): Promise<Metadata> {
  const { id } = await params;
  const report = await getReportById(id);

  if (!report) return { title: "Report not found" };

  const prefix =
    report.status === "reunited"
      ? "Reunited"
      : report.type === "lost"
        ? "Lost"
        : "Found";

  const title = `${prefix}: ${report.title}`;
  const description = `${report.locality}, ${report.city} — ${report.description.slice(0, 160)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: report.image_url
        ? [
            {
              url: cloudinaryTransform(
                report.image_url,
                "f_auto,q_auto,c_fill,g_auto,w_1200,h_630",
              ),
              width: 1200,
              height: 630,
            },
          ]
        : undefined,
    },
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;
  const report = await getReportById(id);

  if (!report) notFound();

  const user = await getCurrentUser();
  const isReporter = user?.id === report.reporter_id;

  const isOpenLost = report.status === "open" && report.type === "lost";
  const isReunited = report.status === "reunited";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href="/lost-found">
          <ArrowLeft aria-hidden />
          Lost &amp; Found
        </Link>
      </Button>

      {/* A reunited report opens with the happy ending, not the emergency. */}
      {isReunited ? (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-success/30 bg-success-muted px-4 py-3 text-success-muted-foreground">
          <HeartHandshake className="size-5 shrink-0" aria-hidden />
          <p className="text-sm font-medium">
            Back home
            {report.reunited_at ? ` — ${relativeTime(report.reunited_at)}` : ""}
            .
          </p>
        </div>
      ) : null}

      <Card
        className={
          isOpenLost
            ? "overflow-hidden rounded-2xl border-alert/40 shadow-card"
            : "overflow-hidden rounded-2xl shadow-card"
        }
      >
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <ReportStatusBadge type={report.type} status={report.status} />
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <SpeciesIcon species={report.species} className="size-3.5" />
              {speciesLabel(report.species)}
            </span>
          </div>

          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-balance">
            {report.title}
          </h1>

          {report.image_url ? (
            <div className="overflow-hidden rounded-xl bg-muted">
              <CloudinaryImage
                src={report.image_url}
                alt={`Photo of the ${speciesLabel(report.species).toLowerCase()} in this report`}
                width={1200}
                height={900}
                transformation="c_limit,w_1200"
                sizes="(max-width: 640px) 100vw, 640px"
                priority
                className="max-h-[60vh] w-full object-contain"
              />
            </div>
          ) : null}

          <p className="text-sm whitespace-pre-line">{report.description}</p>

          <dl className="grid gap-3 rounded-xl bg-muted/60 p-4 text-sm sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <MapPin
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <div>
                <dt className="text-xs text-muted-foreground">Area</dt>
                <dd className="font-medium">
                  {report.locality}, {report.city}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <div>
                <dt className="text-xs text-muted-foreground">
                  {report.type === "lost" ? "Last seen" : "Found at"}
                </dt>
                <dd className="font-medium">
                  <time dateTime={report.last_seen_at}>
                    {absoluteTime(report.last_seen_at)}
                  </time>
                </dd>
              </div>
            </div>

            {report.pet ? (
              <div className="flex items-start gap-2">
                <PawPrint
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <div>
                  <dt className="text-xs text-muted-foreground">Pet profile</dt>
                  <dd className="font-medium">
                    <Link
                      href={`/pets/${report.pet.slug}`}
                      className="rounded-sm text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {report.pet.name}
                    </Link>
                  </dd>
                </div>
              </div>
            ) : null}
          </dl>

          {report.contact_note ? (
            <div className="rounded-xl border border-border p-4">
              <h2 className="font-heading text-sm font-bold">
                How to get in touch
              </h2>
              <p className="mt-1 text-sm whitespace-pre-line">
                {report.contact_note}
              </p>
            </div>
          ) : null}

          <div className="flex items-center gap-3 border-t border-border pt-4">
            <UserAvatar
              name={report.reporter.display_name}
              src={report.reporter.avatar_url}
              size={32}
            />
            <p className="flex-1 text-xs text-muted-foreground">
              Reported by{" "}
              <span className="font-medium text-foreground">
                {report.reporter.display_name}
              </span>{" "}
              <time dateTime={report.created_at}>
                {relativeTime(report.created_at)}
              </time>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ShareButton
              title={report.title}
              text={`${report.locality}, ${report.city}`}
              label="Share this report"
            />
            {isReporter ? (
              <ReportOwnerActions reportId={report.id} status={report.status} />
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
