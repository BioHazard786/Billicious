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
import { timeAgo } from "@/lib/utils";
import { updateProfile } from "@/server/fetchHelpers";
import {
  finishServerPasskeyRegistration,
  getSavedPasskeys,
  startServerPasskeyRegistration,
} from "@/server/passkey_actions";
import useUserInfoStore from "@/store/user-info-store";
import {
  create,
  type CredentialCreationOptionsJSON,
} from "@github/webauthn-json";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Camera, Lock, User } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { GoPasskeyFill } from "react-icons/go";
import { toast } from "sonner";
import { z } from "zod";
import AnimatedButton from "../ui/animated-button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { ImageUploader } from "../ui/image-upload";
import { Input, InputWithLimit } from "../ui/input";
import PasskeyLogo from "../ui/passkey-logo";
import { Spinner } from "../ui/spinner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

type ProfileUpdateFormData = z.infer<typeof profileUpdateFormSchema>;

export default function ProfileForm() {
  const [currentSelectedTab, setCurrentSelectedTab] = useState("info");

  return (
    <Card className="mx-auto mt-20 w-full max-w-lg border-0 px-1">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold tracking-tight text-foreground/90 md:text-3xl">
          Account Settings
        </CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground">
          Update your personal information here.
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full md:mt-4">
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
                Passkeys
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="mt-6 md:mt-10">
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
  const user = useUserInfoStore((state) => state.user);
  const setName = useUserInfoStore((state) => state.setName);
  const setUserName = useUserInfoStore((state) => state.setUserName);
  const form = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateFormSchema),
    defaultValues: {
      email: user?.email,
      name: user?.name,
      username: user?.username,
    },
  });

  const { isPending, mutate: server_handleUpdateProfile } = useMutation({
    mutationFn: updateProfile,
    onMutate: () => {
      const toastId = toast.loading("Updating profile...");
      return { toastId };
    },
    onSuccess: (data, variables, context) => {
      setName(variables.name);
      setUserName(variables.username);
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
      email: data.email,
      userId: user!.id,
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
                <InputWithLimit
                  maxLength={16}
                  characterCount={field.value.length}
                  autoComplete="userName"
                  id="userName"
                  placeholder="Unique Username"
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
            form.getValues("name") === user?.name &&
            form.getValues("username") === user?.username
          }
        >
          Save Changes
        </AnimatedButton>
      </form>
    </Form>
  );
};

const UpdateUserAvatar = () => {
  const user = useUserInfoStore((state) => state.user);
  const setAvatarUrl = useUserInfoStore((state) => state.setAvatarUrl);
  const supabase = useMemo(() => createClient(), []);

  const handleImageUpload = async (image: File) => {
    const { error } = await supabase.storage
      .from("avatars")
      .upload(`${user?.id}/${image.name}`, image, { upsert: true });

    if (error) throw error;

    const { data: imageData } = supabase.storage
      .from("avatars")
      .getPublicUrl(`${user?.id}/${image.name}`);

    await supabase
      .from("users_table")
      .update({ avatar_url: imageData.publicUrl })
      .eq("id", user?.id);

    setAvatarUrl(imageData.publicUrl);
  };

  return (
    <div className="w-full space-y-2">
      {user?.avatar_url ? (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <Avatar className="size-36 ring-2 ring-muted-foreground/25 ring-offset-2 ring-offset-background">
            <AvatarImage src={user?.avatar_url} alt={user?.name || "Avatar"} />
            <AvatarFallback>
              <Spinner loadingSpanClassName="bg-primary" className="size-6" />
            </AvatarFallback>
          </Avatar>
          <ImageUploader
            accept={{ "image/jpeg": [], "image/png": [] }}
            onUpload={handleImageUpload}
            circularCrop={true}
          />
        </div>
      ) : (
        <ImageUploader
          accept={{ "image/jpeg": [], "image/png": [] }}
          onUpload={handleImageUpload}
          circularCrop={true}
        />
      )}
    </div>
  );
};

const RegisterNewPasskey = () => {
  const user = useUserInfoStore((state) => state.user);
  const { slug: groupId } = useParams();

  const { isLoading, data, refetch, isRefetching } = useQuery({
    queryKey: ["passkeys", user?.id, groupId as string],
    queryFn: () => getSavedPasskeys(user?.id as string),
  });

  const { isPending, mutate: server_registerNewPasskey } = useMutation({
    mutationFn: async () => {
      const createOptions = await startServerPasskeyRegistration();
      if ("error" in createOptions) {
        throw new Error(createOptions.error);
      }
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
      await refetch();
      return toast.success("Passkey registered", {
        id: context.toastId,
      });
    },
    onError: (error, variables, context) => {
      console.error(error);
      if (error.message.startsWith("The operation either timed out")) {
        return toast.error("Your device is not supported, try another device", {
          id: context?.toastId,
        });
      }
      return toast.error(error.message, {
        id: context?.toastId,
      });
    },
  });

  const handleRegisterPasskey = () => {
    server_registerNewPasskey();
  };

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-8 overflow-hidden">
      <PasskeyLogo className="h-24 md:h-32 lg:h-40" />
      {/* <PasskeysLogo /> */}
      {isLoading || isRefetching ? (
        <div className="grid h-48 w-[80%] place-items-center rounded-md">
          <Spinner
            loadingSpanClassName="bg-muted-foreground"
            className="size-6 md:size-6 lg:size-7"
          />
        </div>
      ) : (
        <Table>
          <TableCaption>
            {`You have ${data?.length || 0} passkeys registered.`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Last Used</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((passkey) => (
              <TableRow key={passkey.id}>
                <TableCell className="font-medium">{passkey.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {timeAgo(passkey.created_at)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {timeAgo(passkey.last_used_at as string)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Button
        onClick={handleRegisterPasskey}
        className="flex items-center justify-center space-x-2"
        disabled={isPending}
      >
        {isPending ? (
          <Spinner className="mr-2" />
        ) : (
          <GoPasskeyFill className="mr-2 h-5 w-5" />
        )}
        Register a new passkey
      </Button>
    </div>
  );
};
