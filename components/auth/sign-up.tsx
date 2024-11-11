"use client";

import { Button } from "@/components/ui/button";
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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAppleDevice } from "@/hooks/use-apple-device";
import { signUpFormSchema } from "@/lib/schema";
import { signInUsingGoogle, signUpUsingEmail } from "@/server/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { z } from "zod";
import AnimatedButton from "../ui/animated-button";
import { PasswordField } from "../ui/password-input";
import { Spinner } from "../ui/spinner";

export default function SignUp() {
  const isApple = useAppleDevice().isAppleDevice;
  const searchParams = useSearchParams();
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
      if (data) {
        if (data?.error.startsWith("Username")) {
          form.setError("username", { message: data?.error });
          return toast.error(`Username ${variables.username} already taken`, {
            id: context?.toastId,
          });
        }
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
    server_signInUsingGoogle(searchParams.get("next") ?? "/");
  };

  return (
    <Card className="mx-auto w-full max-w-sm space-y-8 border-0 px-1">
      <CardHeader>
        <CardTitle className="mt-6 text-center text-2xl font-bold tracking-tight text-foreground/90 md:text-3xl">
          Create new account
        </CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground">
          Or{" "}
          <Link
            href="/auth/signin"
            className="font-medium text-foreground/80 underline hover:text-primary/90"
          >
            sign in with a existing account
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(handleSignUpWithEmail)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className={isApple ? "text-base" : ""}
                      autoComplete="name"
                      id="name"
                      placeholder="Zaid"
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
                  <FormControl>
                    <Input
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
                  <FormControl>
                    <Input
                      className={isApple ? "text-base" : ""}
                      autoComplete="email"
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
              isDisabled={isSignUpWithEmailPending || isSignUpWithGooglePending}
              isLoading={isSignUpWithEmailPending}
            >
              Create an account
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
            className="relative"
            onClick={handleSignUpWithGoogle}
            disabled={isSignUpWithEmailPending || isSignUpWithGooglePending}
          >
            {isSignUpWithGooglePending ? (
              <Spinner loadingSpanClassName="bg-primary" className="mr-2" />
            ) : (
              <FcGoogle className="mr-2 h-5 w-5" />
            )}
            Sign up with Google
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
