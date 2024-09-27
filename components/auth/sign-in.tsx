"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInFormSchema } from "@/lib/schema";
import { signInUsingEmail, signInUsingGoogle } from "@/server/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
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
import Spinner from "../ui/spinner";

export default function SignIn() {
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
    onError: (error) => {
      console.log(error);
      return toast.error(error.message);
    },
  });

  const handleSignInWithEmail = (data: z.infer<typeof signInFormSchema>) => {
    server_signInUsingEmail(data);
  };

  const handleSignInWithGoogle = () => {
    server_signInUsingGoogle();
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
            <AnimatedButton
              type="submit"
              variant="default"
              className="w-full"
              isDisabled={isSignInWithEmailPending || isSignInWithGooglePending}
              isLoading={isSignInWithEmailPending}
            >
              Sign in
            </AnimatedButton>
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
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="relative flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground/80 shadow-sm hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            onClick={handleSignInWithGoogle}
            disabled={isSignInWithEmailPending || isSignInWithGooglePending}
          >
            {isSignInWithGooglePending ? (
              <Spinner loadingSpanClassName="bg-primary" className="mr-2" />
            ) : (
              <FcGoogle className="mr-2 h-5 w-5" />
            )}
            Sign in with Google
            {/* <div className="absolute left-full top-1/2 ml-8 -translate-y-1/2 whitespace-nowrap rounded-md bg-accent px-4 py-1 text-xs text-foreground/80">
                <div className="absolute -left-5 top-0 border-[12px] border-background border-r-accent" />
                Last used
              </div> */}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
