"use client";

import { useAppleDevice } from "@/hooks/use-apple-device";
import { resetPassword } from "@/server/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import AnimatedButton from "../ui/animated-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";

const ForgotPassword = () => {
  const isApple = useAppleDevice().isAppleDevice;
  const forgottenPasswordFormSchema = z.object({ email: z.string().email() });
  const form = useForm<z.infer<typeof forgottenPasswordFormSchema>>({
    resolver: zodResolver(forgottenPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const { isPending, mutate: server_resetPassword } = useMutation({
    mutationFn: resetPassword,
    onMutate: () => {
      const toastId = toast.loading("Sending reset email...");
      return { toastId };
    },
    onSuccess: (data, variables, context) => {
      if (data?.error) {
        return toast.error(data?.error, {
          id: context?.toastId,
        });
      }
      return toast.info(
        "If you registered using your email and password, you will receive a password reset email. The password reset link expires in 10 minutes.",
        {
          id: context.toastId,
        },
      );
    },
    onError: (error, variables, context) => {
      return toast.error(error.message, {
        id: context?.toastId,
      });
    },
  });

  const sendResetEmail = async (
    data: z.infer<typeof forgottenPasswordFormSchema>,
  ) => {
    server_resetPassword(data.email);
  };

  return (
    <Card className="mx-auto w-full max-w-sm space-y-6 border-0 px-1">
      <CardHeader>
        <CardTitle className="mt-6 text-center text-2xl font-semibold tracking-tight text-foreground/90 md:text-3xl">
          Reset Your Password
        </CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground">
          Type in your email and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(sendResetEmail)}
            className="space-y-4"
          >
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
            <Separator />
            <AnimatedButton
              isLoading={isPending}
              variant="default"
              className="w-full"
            >
              Send Reset Email
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
};

export default ForgotPassword;
