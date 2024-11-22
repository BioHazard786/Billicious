"use client";

import { createClient } from "@/auth-utils/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageUploader } from "@/components/ui/image-upload";
import { Spinner } from "@/components/ui/spinner";
import useDashboardStore from "@/store/dashboard-store";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { AspectRatio } from "../ui/aspect-ratio";

const Settings = () => {
  return (
    <Card className="mx-auto mt-12 w-full max-w-lg border-0 px-1">
      <CardHeader>
        <CardTitle className="mt-6 text-center text-2xl font-bold tracking-tight text-foreground/90 md:text-3xl">
          Group Settings
        </CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground">
          Update your group information here.
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full md:mt-4">
        <UpdateGroupCoverImage />
      </CardContent>
    </Card>
  );
};

const UpdateGroupCoverImage = () => {
  const { slug: groupId } = useParams();
  const backgroundUrl = useDashboardStore((state) => state.backgroundUrl);
  const updateBackgroundUrl = useDashboardStore(
    (state) => state.updateBackgroundUrl,
  );
  const supabase = useMemo(() => createClient(), []);

  const handleImageUpload = async (image: File) => {
    const { error } = await supabase.storage
      .from("group_cover_image")
      .upload(`${groupId as string}/${image.name}`, image, { upsert: true });

    if (error) throw error;

    const { data: imageData } = supabase.storage
      .from("group_cover_image")
      .getPublicUrl(`${groupId as string}/${image.name}`);

    await supabase
      .from("groups_table")
      .update({ background_url: imageData.publicUrl })
      .eq("id", groupId as string);

    updateBackgroundUrl(imageData.publicUrl);
  };

  return (
    <div className="w-full space-y-2">
      {backgroundUrl ? (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <AspectRatio ratio={20 / 9} className="rounded-lg bg-muted">
            <Avatar className="h-full w-full rounded-lg ring-2 ring-muted-foreground/25 ring-offset-2 ring-offset-background">
              <AvatarImage
                src={backgroundUrl}
                alt={(groupId as string) || "Avatar"}
              />
              <AvatarFallback className="rounded-lg">
                <Spinner loadingSpanClassName="bg-primary" className="size-6" />
              </AvatarFallback>
            </Avatar>
          </AspectRatio>
          <ImageUploader
            accept={{ "image/jpeg": [], "image/png": [] }}
            onUpload={handleImageUpload}
            aspect={20 / 9}
            toastLoadingMessage="Updating group cover image..."
            toastSuccessMessage="Group cover image updated successfully"
          />
        </div>
      ) : (
        <ImageUploader
          accept={{ "image/jpeg": [], "image/png": [] }}
          onUpload={handleImageUpload}
          aspect={20 / 9}
          toastLoadingMessage="Updating group cover image..."
          toastSuccessMessage="Group cover image updated successfully"
        />
      )}
    </div>
  );
};

export default Settings;
