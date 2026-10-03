import type { Metadata } from "next";
import Link from "next/link";
import { PawPrint } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PostComposer } from "@/components/posts/post-composer";
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
  title: "New post",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const profile = await requireOnboardedProfile();
  const pets = await listPetsByOwner(profile.id);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      {pets.length === 0 ? (
        <EmptyState
          icon={PawPrint}
          title="You need a pet first"
          description="Posts are made as a pet, not as you. Create a pet profile and then come back."
          action={
            <Button asChild className="mt-1 h-10">
              <Link href="/pets/new">Add a pet</Link>
            </Button>
          }
        />
      ) : (
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-xl">New post</CardTitle>
            <CardDescription>
              Share a moment as one of your pets. Photos are required; the
              caption is not.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PostComposer pets={pets} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
