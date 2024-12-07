"use client";

import { createClient } from "@/auth-utils/client";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { cn, timeAgo } from "@/lib/utils";
import { deleteGroup } from "@/server/fetchHelpers";
import useDashboardStore from "@/store/dashboard-store";
import useUserInfoStore from "@/store/user-info-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, TriangleAlert } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import { toast } from "sonner";
import AnimatedButton from "../ui/animated-button";
import { AspectRatio } from "../ui/aspect-ratio";
import { Button } from "../ui/button";
import { GridPattern } from "../ui/grid-pattern";
import NoContent from "../ui/no-content";
import { Separator } from "../ui/separator";
import Stop from "../ui/stop";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const Settings = () => {
  const members = useDashboardStore((state) => state.members);
  const user = useUserInfoStore((state) => state.user);
  const [currentSelectedTab, setCurrentSelectedTab] = useState("coverImage");

  const isAdmin = useMemo(() => {
    return (
      members.find((member) => member.memberId === user?.id)?.isAdmin ?? false
    );
  }, [members, user]);

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-4">
        <Stop className="size-32 md:size-48" />
        <div className="space-y-1 text-center">
          <p className="text-lg font-semibold md:text-xl">Access Denied</p>
          <p className="text-sm text-muted-foreground md:text-base">
            Hold up! It seems like you don’t have permission to manage this
            group’s settings. Contact an admin to gain access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="mx-auto mt-20 w-full max-w-lg border-0 px-1">
      <CardHeader>
        <CardTitle className="mt-6 text-center text-2xl font-bold tracking-tight text-foreground/90 md:text-3xl">
          Group Settings
        </CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground">
          Update your group information here.
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full md:mt-4">
        {/* <UpdateGroupCoverImage /> */}
        <Tabs
          value={currentSelectedTab}
          onValueChange={(tabName) => setCurrentSelectedTab(tabName)}
          className="w-full"
        >
          <div className="flex w-full justify-center">
            <TabsList className="w-min">
              <TabsTrigger value="coverImage">
                <Camera className="mr-2 size-4" />
                Cover Image
              </TabsTrigger>
              <TabsTrigger value="delete">
                <TriangleAlert className="mr-2 size-4" />
                Delete Group
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="mt-6 md:mt-10">
            <TabsContent value="coverImage">
              <UpdateGroupCoverImage />
            </TabsContent>
            <TabsContent value="delete">
              <DeleteGroup />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const UpdateGroupCoverImage = () => {
  const { slug: groupId } = useParams();
  const coverUrl = useDashboardStore((state) => state.backgroundUrl);
  const updateCoverUrl = useDashboardStore(
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

    updateCoverUrl(imageData.publicUrl);
  };

  return (
    <div className="w-full space-y-2">
      {coverUrl ? (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <AspectRatio ratio={20 / 9} className="rounded-lg bg-muted">
            <Avatar className="h-full w-full rounded-lg ring-2 ring-muted-foreground/25 ring-offset-2 ring-offset-background">
              <AvatarImage
                src={coverUrl}
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

const DeleteGroup = () => {
  const coverUrl = useDashboardStore((state) => state.backgroundUrl);
  const groupName = useDashboardStore((state) => state.name);
  const groupId = useDashboardStore((state) => state.id);
  const user = useUserInfoStore((state) => state.user);
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const { isPending, mutateAsync: server_deleteGroup } = useMutation({
    mutationFn: deleteGroup,
    onMutate: () => {
      const toastId = toast.loading(`Deleting ${groupName} group...`);
      return { toastId };
    },
    onSuccess: async (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["homepage", user!.id],
        exact: true,
      });
      router.replace("/");
      return toast.success(`${groupName} deleted successfully`, {
        id: context.toastId,
      });
    },
    onError: (error, variables, context) => {
      console.log(error);
      return toast.error(error.message, {
        id: context?.toastId,
      });
    },
    onSettled: () => {
      setIsOpen(false);
    },
  });

  const handleDeleteGroup = async () => {
    await server_deleteGroup(groupId);
  };

  return (
    <div className="pb-[5.563rem]">
      <div className="space-y-4 rounded-md rounded-b-none border-2 border-b-0 border-destructive-foreground p-4">
        <h2 className="text-xl font-semibold">Delete this group</h2>
        <p className="text-sm">
          Once you delete a group, there is no going back. Please be certain.
        </p>
        <Separator />
        <AspectRatio
          ratio={20 / 9}
          className="relative flex items-center justify-center overflow-hidden rounded-md border bg-muted"
        >
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={groupName}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div>
              <span className="z-10 max-w-full truncate text-xl font-bold text-secondary-foreground md:text-2xl">
                #{groupName}
              </span>
              <GridPattern
                squares={[
                  [4, 4],
                  [5, 1],
                  [8, 2],
                  [5, 3],
                  [5, 5],
                  [10, 10],
                  [12, 15],
                  [15, 10],
                  [10, 15],
                  [15, 10],
                  [10, 15],
                  [15, 10],
                ]}
                className={cn(
                  "[mask-image:radial-gradient(100px_circle_at_center,white,transparent)]",
                  "md:[mask-image:radial-gradient(150px_circle_at_center,white,transparent)]",
                  "lg:[mask-image:radial-gradient(200px_circle_at_center,white,transparent)]",
                  "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
                )}
              />
            </div>
          )}
        </AspectRatio>
      </div>
      <div className="flex justify-end rounded-md rounded-t-none border-2 border-destructive-foreground bg-destructive-foreground/70 p-4">
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full md:w-auto">
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="z-[200]">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                group and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <AnimatedButton
                isLoading={isPending}
                variant="destructive"
                onClick={handleDeleteGroup}
              >
                Delete
              </AnimatedButton>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Settings;
