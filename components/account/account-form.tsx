"use client";

import { createClient } from "@/auth-utils/client";
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
import Image from "next/image";

import { titleCase } from "@/lib/utils";
import useUserInfoStore from "@/store/user-info-store";
import { useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import AnimatedButton from "../ui/animated-button";
import { ImageUploader } from "../ui/image-upload";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const profileUpdateFormSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: "Name must contain at least 2 character(s)" })
    .max(32, { message: "Name must contain at most 32 character(s)" }),
});

type ProfileUpdateFormData = z.infer<typeof profileUpdateFormSchema>;

export default function AccountForm() {
  const supabase = useMemo(() => createClient(), []);
  const user = useUserInfoStore((state) => state);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateFormSchema),
    defaultValues: {
      full_name: user.user?.full_name,
    },
  });

  const handleUpdateProfile = async (formData: ProfileUpdateFormData) => {
    if (formData.full_name === user.user?.full_name)
      return toast.error("Please update name");
    startTransition(async () => {
      try {
        await supabase
          .from("profiles")
          .update({ full_name: titleCase(formData.full_name) })
          .eq("id", user.user?.id);
        user.setFullName(titleCase(formData.full_name));
        toast.success("Name Updated!");
      } catch (error) {
        toast.error("Failed to update name");
      }
    });
  };

  const handleFileUpload = async (files: File[]) => {
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(`${user.user?.id}/${files[0].name}`, files[0], { upsert: true });
    console.log(error);
    if (error) throw error;
    const newAvatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL!}storage/v1/object/public/${data.fullPath}`;
    await supabase
      .from("profiles")
      .update({ avatar_url: newAvatarUrl })
      .eq("id", user.user?.id);
    user.setAvatarUrl(newAvatarUrl);
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
      <CardContent className="space-y-8">
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
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      type="name"
                      id="full_name"
                      placeholder="Name"
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
            >
              Save Changes
            </AnimatedButton>
            <div>
              <Label htmlFor="avatar">Avatar</Label>
              {user.user?.avatar_url ? (
                <div className="flex flex-col items-center justify-center gap-4">
                  <Image
                    src={user.user?.avatar_url}
                    alt={user.user?.full_name || "Avatar"} // Fallback alt if fullName is undefined
                    width={150} // Specify a width
                    height={150} // Specify a height
                    className="aspect-square rounded-full object-cover"
                  />
                  <ImageUploader onUpload={handleFileUpload} />
                </div>
              ) : (
                <ImageUploader onUpload={handleFileUpload} />
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
