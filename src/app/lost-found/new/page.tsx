import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ReportForm } from "@/components/reports/report-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireOnboardedProfile } from "@/lib/auth";
import { listPetsByOwner } from "@/lib/pets";

export const metadata: Metadata = {
  title: "File a report",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function NewReportPage() {
  const profile = await requireOnboardedProfile();
  const pets = await listPetsByOwner(profile.id);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href="/lost-found">
          <ArrowLeft aria-hidden />
          Lost &amp; Found
        </Link>
      </Button>

      <Card className="rounded-2xl shadow-card">
        <CardHeader>
          <CardTitle className="font-heading text-xl">File a report</CardTitle>
          <CardDescription>
            Reports are public, so anyone who spots the pet can read them —
            including people without an account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportForm pets={pets} />
        </CardContent>
      </Card>
    </div>
  );
}
