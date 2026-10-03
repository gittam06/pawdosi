import type { Metadata } from "next";

import { ProfileForm } from "./profile-form";
import { removeAvatarAction, updateAvatarAction } from "@/actions/profile";
import { ImageUploader } from "@/components/upload/image-uploader";
import { UserAvatar } from "@/components/user-avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireOnboardedProfile } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Profile settings",
  robots: { index: false },
};

// Session-dependent: never cache one person's settings for another.
export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  const profile = await requireOnboardedProfile();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <header className="mb-6 space-y-1">
        <h1 className="font-heading text-2xl font-bold">Your profile</h1>
        <p className="text-sm text-muted-foreground">
          This is the human behind the pets. Your pets get their own profiles.
        </p>
      </header>

      <div className="space-y-4">
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Photo</CardTitle>
            <CardDescription>
              Shown next to your comments and your pets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploader
              folder="avatar"
              currentUrl={profile.avatar_url}
              preview={
                <UserAvatar
                  name={profile.display_name}
                  src={profile.avatar_url}
                  size={72}
                />
              }
              onUpload={updateAvatarAction}
              onRemove={removeAvatarAction}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Details</CardTitle>
            <CardDescription>
              Your username appears in links; your city powers nearby Lost &amp;
              Found results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
