import Link from "next/link";
import { Clock, MapPin } from "lucide-react";

import { cn } from "cn";
import { CloudinaryImage } from "@/components/cloudinary-image";
import { SpeciesIcon } from "@/components/pets/species-icon";
import { ReportStatusBadge } from "@/components/reports/report-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { speciesLabel } from "@/config/pets";
import { absoluteTime, relativeTime } from "@/lib/relative-time";
import type { ReportWithReporter } from "@/lib/types";

/**
 * An open lost report gets a tinted surface and an alert-coloured edge, so it
 * stands out while scanning a column of cards. Reunited reports go quiet and
 * green — resolved, still visible, no longer shouting.
 */
export function ReportCard({ report }: { report: ReportWithReporter }) {
  const isOpenLost = report.status === "open" && report.type === "lost";
  const isReunited = report.status === "reunited";

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-2xl shadow-card transition-shadow focus-within:shadow-lift hover:shadow-lift",
        isOpenLost && "border-alert/40 bg-alert-muted/30",
        isReunited && "border-success/30 bg-success-muted/20",
      )}
    >
      <CardContent className="flex gap-4">
        <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-24">
          {report.image_url ? (
            <CloudinaryImage
              src={report.image_url}
              alt=""
              width={200}
              height={200}
              transformation="c_fill,g_auto,w_200,h_200"
              className="size-full"
            />
          ) : (
            <span
              className="flex size-full items-center justify-center text-muted-foreground"
              aria-hidden
            >
              <SpeciesIcon species={report.species} className="size-8" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <ReportStatusBadge type={report.type} status={report.status} />
            <span className="text-xs text-muted-foreground">
              {speciesLabel(report.species)}
            </span>
          </div>

          <h3 className="font-heading text-base leading-tight font-bold">
            <Link
              href={`/lost-found/${report.id}`}
              className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
            >
              {report.title}
            </Link>
          </h3>

          <p className="line-clamp-2 text-sm text-pretty text-muted-foreground">
            {report.description}
          </p>

          <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Area</dt>
              <dd className="flex items-center gap-1.5">
                <MapPin className="size-3.5" aria-hidden />
                {report.locality}, {report.city}
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">
                {report.type === "lost" ? "Last seen" : "Found"}
              </dt>
              <dd className="flex items-center gap-1.5">
                <Clock className="size-3.5" aria-hidden />
                <time
                  dateTime={report.last_seen_at}
                  title={absoluteTime(report.last_seen_at)}
                >
                  {relativeTime(report.last_seen_at)}
                </time>
              </dd>
            </div>
          </dl>
        </div>
      </CardContent>
    </Card>
  );
}
