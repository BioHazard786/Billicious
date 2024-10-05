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
import { profileUpdateFormSchema } from "@/lib/schema";
import { passkeyRegistered } from "@/server/actions";
import { updateProfile } from "@/server/fetchHelpers";
import {
  finishServerPasskeyRegistration,
  startServerPasskeyRegistration,
} from "@/server/passkey_actions";
import useUserInfoStore from "@/store/user-info-store";
import {
  create,
  type CredentialCreationOptionsJSON,
} from "@github/webauthn-json";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Camera, Lock, User } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { GoPasskeyFill } from "react-icons/go";
import { toast } from "sonner";
import { z } from "zod";
import AnimatedButton from "../ui/animated-button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { ImageUploader } from "../ui/image-upload";
import { Input } from "../ui/input";
import PasskeyAnimation from "../ui/passkey_animation";
import Spinner from "../ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

type ProfileUpdateFormData = z.infer<typeof profileUpdateFormSchema>;

export default function AccountForm() {
  const user = useUserInfoStore((state) => state);

  if (!user) {
    return <div>No User exists</div>;
  }

  const [currentSelectedTab, setCurrentSelectedTab] = useState("info");

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
      <CardContent className="w-full">
        <Tabs
          value={currentSelectedTab}
          onValueChange={(tabName) => setCurrentSelectedTab(tabName)}
          className="w-full"
        >
          <div className="flex w-full justify-center">
            <TabsList className="w-min">
              <TabsTrigger value="info">
                <User className="mr-2 size-4" />
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="avatar">
                <Camera className="mr-2 size-4" />
                Avatar
              </TabsTrigger>
              <TabsTrigger value="passkey">
                <Lock className="mr-2 size-4" />
                Security
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="mt-14">
            <TabsContent value="info">
              <UpdateUserInfo />
            </TabsContent>
            <TabsContent value="avatar">
              <UpdateUserAvatar />
            </TabsContent>
            <TabsContent value="passkey">
              <RegisterNewPasskey />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

const UpdateUserInfo = () => {
  const user = useUserInfoStore((state) => state);
  const form = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateFormSchema),
    defaultValues: {
      email: user.user?.email,
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

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(handleUpdateProfile)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  disabled
                  type="email"
                  id="email"
                  placeholder="Email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="name" id="name" placeholder="Name" {...field} />
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
      </form>
    </Form>
  );
};

const UpdateUserAvatar = () => {
  const user = useUserInfoStore((state) => state);
  const supabase = useMemo(() => createClient(), []);
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

  return (
    <div className="w-full space-y-2">
      {user.user?.avatar_url ? (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <Avatar className="size-36 ring-2 ring-muted-foreground/25 ring-offset-2 ring-offset-background">
            <AvatarImage
              src={user.user?.avatar_url}
              alt={user.user?.name || "Avatar"}
            />
            <AvatarFallback>
              <Spinner loadingSpanClassName="bg-primary" className="size-6" />
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
  );
};

const RegisterNewPasskey = () => {
  const user = useUserInfoStore((state) => state.user);
  const setHasPasskeys = useUserInfoStore((state) => state.setHasPasskeys);

  const { isPending, mutate: server_registerNewPasskey } = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const createOptions = await startServerPasskeyRegistration();
      const credential = await create(
        createOptions as CredentialCreationOptionsJSON,
      );
      await finishServerPasskeyRegistration(credential);
    },
    onMutate: () => {
      const toastId = toast.loading("Registering passkey...");
      return { toastId };
    },
    onSuccess: async (data, variables, context) => {
      const response = await passkeyRegistered(variables.userId);
      if (response)
        return toast.error(response.error, {
          id: context.toastId,
        });
      setHasPasskeys();
      return toast.success("Passkey registered", {
        id: context.toastId,
      });
    },
    onError: (error, variables, context) => {
      return toast.error(error.message, {
        id: context?.toastId,
      });
    },
  });

  const handleRegisterPasskey = (userId: string) => {
    server_registerNewPasskey({ userId });
  };

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-2">
      <PasskeyAnimation />
      <Button
        onClick={() => handleRegisterPasskey(user!.id)}
        className="flex items-center justify-center space-x-2"
        disabled={isPending || user?.has_passkey}
      >
        {isPending ? (
          <Spinner loadingSpanClassName="bg-primary" className="mr-2" />
        ) : (
          <GoPasskeyFill className="mr-2 h-5 w-5" />
        )}
        Register a new passkey
      </Button>
      {user?.has_passkey && (
        <div className="text-xs text-muted-foreground">
          You has already registerd a passkey
        </div>
      )}
    </div>
  );
};
