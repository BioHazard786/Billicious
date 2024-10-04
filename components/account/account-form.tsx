"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createClient } from "@/auth-utils/client";
import { profileUpdateFormSchema } from "@/lib/schema";
import { updateProfile } from "@/server/fetchHelpers";
import useUserInfoStore from "@/store/user-info-store";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import AnimatedButton from "../ui/animated-button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ImageUploader } from "../ui/image-upload";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import Spinner from "../ui/spinner";

type ProfileUpdateFormData = z.infer<typeof profileUpdateFormSchema>;

export default function AccountForm() {
  const user = useUserInfoStore((state) => state);
  const supabase = useMemo(() => createClient(), []);
  const form = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateFormSchema),
    defaultValues: {
      name: user.user?.name,
      username: user.user?.username,
    },
  });

  const { isPending, mutate: server_handleUpdateProfile } = useMutation({
    mutationFn: updateProfile,
    onMutate: () => {
      const toastId = toast.loading("Updating profile...");
      return { toastId };
    },
    onSuccess: (data, variables, context) => {
      user.setName(variables.name);
      user.setUserName(variables.username);
      return toast.success("Profile updated", {
        id: context.toastId,
      });
    },
    onError: (error, variables, context) => {
      if (error?.message.startsWith("Username")) {
        form.setError("username", { message: error?.message });
        return toast.error(`Username ${variables.username} already taken`, {
          id: context?.toastId,
        });
      }
      return toast.error(error.message, {
        id: context?.toastId,
      });
    },
  });

  const handleUpdateProfile = (data: ProfileUpdateFormData) => {
    server_handleUpdateProfile({
      userId: user!.user!.id,
      name: data.name,
      username: data.username,
    });
  };

  const handleImageUpload = async (image: File) => {
    const { error } = await supabase.storage
      .from("avatars")
      .upload(`${user.user?.id}/${image.name}`, image, { upsert: true });

    if (error) throw error;

    const { data: imageData } = supabase.storage
      .from("avatars")
      .getPublicUrl(`${user.user?.id}/${image.name}`);

    await supabase
      .from("profiles")
      .update({ avatar_url: imageData.publicUrl })
      .eq("id", user.user?.id);

    user.setAvatarUrl(imageData.publicUrl);
  };

  if (!user) {
    return <div>No User exists</div>;
  }

  return (
    <Card className="mx-auto mt-12 w-full max-w-lg space-y-8 border-0 px-1">
      <CardHeader>
        <CardTitle className="mt-6 text-center text-2xl font-bold tracking-tight text-foreground/90 md:text-3xl">
          Account Settings
        </CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground">
          Update your personal information here.
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full space-y-8">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            disabled
            type="email"
            placeholder="Email"
            value={user.user?.email}
          />
        </div>
        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(handleUpdateProfile)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      type="name"
                      id="name"
                      placeholder="Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      type="username"
                      id="username"
                      placeholder="Username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AnimatedButton
              isLoading={isPending}
              className="w-full"
              type="submit"
              variant="default"
              isDisabled={
                form.getValues("name") === user.user?.name &&
                form.getValues("username") === user.user?.username
              }
            >
              Save Changes
            </AnimatedButton>
            <div className="w-full">
              <Label htmlFor="avatar">Avatar</Label>
              {user.user?.avatar_url ? (
                <div className="flex w-full flex-col items-center justify-center gap-4">
                  <Avatar className="size-36 ring-2 ring-muted-foreground/25 ring-offset-2 ring-offset-background">
                    <AvatarImage
                      src={user.user?.avatar_url}
                      alt={user.user?.name || "Avatar"}
                    />
                    <AvatarFallback>
                      <Spinner
                        loadingSpanClassName="bg-primary"
                        className="size-6"
                      />
                    </AvatarFallback>
                  </Avatar>
                  <ImageUploader
                    accept={{ "image/jpeg": [], "image/png": [] }}
                    onUpload={handleImageUpload}
                  />
                </div>
              ) : (
                <ImageUploader
                  accept={{ "image/jpeg": [], "image/png": [] }}
                  onUpload={handleImageUpload}
                />
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
