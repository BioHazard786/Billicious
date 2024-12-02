"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Input, InputWithLimit } from "@/components/ui/input";
import { useAppleDevice } from "@/hooks/use-apple-device";
import { signUpFormSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { signInUsingGoogle, signUpUsingEmail } from "@/server/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { FaGoogle } from "react-icons/fa";
import { toast } from "sonner";
import { z } from "zod";
import AnimatedButton from "../ui/animated-button";
import { PasswordField, PasswordStrengthField } from "../ui/password-input";
import { Spinner } from "../ui/spinner";

export default function SignUp({
  lastSignedInMethod,
}: {
  lastSignedInMethod?: string;
}) {
  const isApple = useAppleDevice().isAppleDevice;
  const form = useForm<z.infer<typeof signUpFormSchema>>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const {
    isPending: isSignUpWithEmailPending,
    mutate: server_signUpUsingEmail,
  } = useMutation({
    mutationFn: signUpUsingEmail,
    onMutate: () => {
      const toastId = toast.loading("Signing Up...");
      return { toastId };
    },
    onSuccess: (data, variables, context) => {
      if (data?.error?.startsWith("Username")) {
        form.setError("username", { message: data?.error });
        return toast.error(`Username ${variables.username} already taken`, {
          id: context?.toastId,
        });
      }
      if (data?.success) {
        return toast.info(data?.success, { id: context?.toastId });
      }
      return toast.error(data?.error, {
        id: context?.toastId,
      });
    },
    onError: (error, variables, context) => {
      return toast.error(error.message, {
        id: context?.toastId,
      });
    },
    onSettled: () => {
      form.reset();
    },
  });

  const {
    isPending: isSignUpWithGooglePending,
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

  const handleSignUpWithEmail = (data: z.infer<typeof signUpFormSchema>) => {
    server_signUpUsingEmail(data);
  };

  const handleSignUpWithGoogle = () => {
    server_signInUsingGoogle("/register/passkey");
  };

  return (
    <Card className="mx-auto w-full max-w-sm space-y-6 border-0 px-1">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-semibold tracking-tight text-foreground/90 md:text-3xl">
          Get Started
        </CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground">
          Create a new account
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <Button
          variant={lastSignedInMethod === "google" ? "secondary" : "outline"}
          className={cn(
            "relative",
            lastSignedInMethod === "google" &&
              "ring-1 ring-muted-foreground/25 ring-offset-[3px] ring-offset-background",
          )}
          onClick={handleSignUpWithGoogle}
          disabled={isSignUpWithEmailPending || isSignUpWithGooglePending}
        >
          {isSignUpWithGooglePending ? (
            <Spinner loadingSpanClassName="bg-primary" className="mr-2" />
          ) : (
            <FaGoogle className="mr-2 size-4" />
          )}
          Continue with Google
          {lastSignedInMethod === "google" && (
            <div className="absolute left-full top-1/2 ml-2 size-2.5 -translate-y-1/2 animate-pulse whitespace-nowrap rounded-full bg-primary md:hidden" />
          )}
          {lastSignedInMethod === "google" && (
            <div className="absolute left-full top-1/2 ml-8 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-accent px-4 py-1 text-xs text-foreground/80 md:block">
              <div className="absolute -left-5 top-0 border-[12px] border-background border-r-accent" />
              Last used
            </div>
          )}
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(handleSignUpWithEmail)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      className={isApple ? "text-base" : ""}
                      autoComplete="name"
                      id="name"
                      placeholder="Sweetie Pie"
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
                    <InputWithLimit
                      maxLength={16}
                      characterCount={field.value.length}
                      className={isApple ? "text-base" : ""}
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
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      className={isApple ? "text-base" : ""}
                      autoComplete="email"
                      id="email"
                      placeholder="you@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <PasswordStrengthField />
            <AnimatedButton
              type="submit"
              variant="default"
              className="w-full"
              isDisabled={isSignUpWithEmailPending || isSignUpWithGooglePending}
              isLoading={isSignUpWithEmailPending}
            >
              Sign Up
            </AnimatedButton>
          </form>
        </Form>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          Have an account?{" "}
          <Link
            href="/auth/signin"
            className="ml-1 text-foreground underline transition hover:text-muted-foreground"
          >
            Sign In Now
          </Link>
        </CardFooter>
      </CardContent>
    </Card>
  );
}
