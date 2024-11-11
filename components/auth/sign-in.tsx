"use client";

import { getUserID } from "@/auth-utils/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppleDevice } from "@/hooks/use-apple-device";
import { signInFormSchema } from "@/lib/schema";
import {
  signInUsingEmail,
  signInUsingGoogle,
  signInUsingPasskey,
} from "@/server/actions";
import {
  finishServerPasskeyLogin,
  startServerPasskeyLogin,
} from "@/server/passkey_actions";
import { get } from "@github/webauthn-json";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { GoPasskeyFill } from "react-icons/go";
import { toast } from "sonner";
import { z } from "zod";
import AnimatedButton from "../ui/animated-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { PasswordField } from "../ui/password-input";
import { Spinner } from "../ui/spinner";

export default function SignIn({
  lastSignedInMethod,
}: {
  lastSignedInMethod?: string;
}) {
  const searchParams = useSearchParams();
  const isApple = useAppleDevice().isAppleDevice;
  const form = useForm<z.infer<typeof signInFormSchema>>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    isPending: isSignInWithEmailPending,
    mutate: server_signInUsingEmail,
  } = useMutation({
    mutationFn: signInUsingEmail,
    onMutate: () => {
      const toastId = toast.loading("Signing In...");
      return { toastId };
    },
    onSuccess: (data, variables, context) => {
      if (data) {
        return toast.error(data?.error, {
          id: context?.toastId,
        });
      }
      return toast.success("Signed In successfully", {
        id: context.toastId,
      });
    },
    onError: (error, variables, context) => {
      return toast.error(error.message, {
        id: context?.toastId,
      });
    },
  });

  const {
    isPending: isSignInWithGooglePending,
    mutate: server_signInUsingGoogle,
  } = useMutation({
    mutationFn: signInUsingGoogle,
    onSuccess: (data) => {
      if (data) {
        return toast.error(data?.error);
      }
    },
    onError: (error) => {
      console.log(error);
      return toast.error(error.message);
    },
  });

  const {
    isPending: isSignInWithPasskeyPending,
    mutate: server_signInUsingPasskey,
  } = useMutation({
    mutationFn: async (next: string) => {
      const assertion = await startServerPasskeyLogin();
      const credential = await get(assertion as any);
      const response = await finishServerPasskeyLogin(credential);
      if (!response || !response.token) {
        return { error: "Passkey not set" };
      }
      const { token } = response;
      const userId = await getUserID(token);
      if (!userId) {
        return { error: "User id not found" };
      }
      await signInUsingPasskey(userId, next);
    },
    onMutate: () => {
      const toastId = toast.loading("Signing In...");
      return { toastId };
    },
    onSuccess: (data, variables, context) => {
      if (data) {
        return toast.error(data?.error, {
          id: context?.toastId,
        });
      }
      return toast.success("Signed In successfully", {
        id: context.toastId,
      });
    },
    onError: (error, variables, context) => {
      return toast.error(error.message, {
        id: context?.toastId,
      });
    },
  });

  const handleSignInWithEmail = (data: z.infer<typeof signInFormSchema>) => {
    const dataWithNextUrl = { ...data, next: searchParams.get("next") ?? "/" };
    server_signInUsingEmail(dataWithNextUrl);
  };

  const handleSignInWithGoogle = () => {
    server_signInUsingGoogle(searchParams.get("next") ?? "/");
  };

  const handleSignInWithPasskey = () => {
    server_signInUsingPasskey(searchParams.get("next") ?? "/");
  };

  return (
    <Card className="mx-auto w-full max-w-sm space-y-8 border-0 px-1">
      <CardHeader>
        <CardTitle className="mt-6 text-center text-2xl font-bold tracking-tight text-foreground/90 md:text-3xl">
          Sign in to your account
        </CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground">
          Or{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-foreground/80 underline hover:text-primary/90"
          >
            sign up for a new account
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(handleSignInWithEmail)}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className={isApple ? "text-base" : ""}
                      type="email"
                      id="email"
                      placeholder="billicious@popular.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <PasswordField />
            <div className="relative">
              <AnimatedButton
                type="submit"
                variant="default"
                className="w-full"
                isDisabled={
                  isSignInWithEmailPending ||
                  isSignInWithGooglePending ||
                  isSignInWithPasskeyPending
                }
                isLoading={isSignInWithEmailPending}
              >
                <span>Sign in</span>
                {lastSignedInMethod === "email" && (
                  <span className="ml-2 inline md:hidden">(Last used)</span>
                )}
              </AnimatedButton>
              {lastSignedInMethod === "email" && (
                <div className="absolute left-full top-1/2 ml-8 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-accent px-4 py-1 text-xs text-foreground/80 md:block">
                  <div className="absolute -left-5 top-0 border-[12px] border-background border-r-accent" />
                  Last used
                </div>
              )}
            </div>
          </form>
        </Form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="relative"
            onClick={handleSignInWithGoogle}
            disabled={
              isSignInWithEmailPending ||
              isSignInWithGooglePending ||
              isSignInWithPasskeyPending
            }
          >
            {isSignInWithGooglePending ? (
              <Spinner loadingSpanClassName="bg-primary" className="mr-2" />
            ) : (
              <FcGoogle className="mr-2 h-5 w-5" />
            )}
            <span>Sign in with Google</span>
            {lastSignedInMethod === "google" && (
              <span className="ml-2 inline md:hidden">(Last used)</span>
            )}
            {lastSignedInMethod === "google" && (
              <div className="absolute left-full top-1/2 ml-8 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-accent px-4 py-1 text-xs text-foreground/80 md:block">
                <div className="absolute -left-5 top-0 border-[12px] border-background border-r-accent" />
                Last used
              </div>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleSignInWithPasskey}
            className="relative"
            disabled={
              isSignInWithEmailPending ||
              isSignInWithGooglePending ||
              isSignInWithPasskeyPending
            }
          >
            {isSignInWithPasskeyPending ? (
              <Spinner loadingSpanClassName="bg-primary" className="mr-2" />
            ) : (
              <GoPasskeyFill className="mr-2 h-5 w-5" />
            )}
            <span>Sign in with Passkey</span>
            {lastSignedInMethod === "passkey" && (
              <span className="ml-2 inline md:hidden">(Last used)</span>
            )}
            {lastSignedInMethod === "passkey" && (
              <div className="absolute left-full top-1/2 ml-8 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-accent px-4 py-1 text-xs text-foreground/80 md:block">
                <div className="absolute -left-5 top-0 border-[12px] border-background border-r-accent" />
                Last used
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
