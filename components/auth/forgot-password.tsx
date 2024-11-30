"use client";

import { useAppleDevice } from "@/hooks/use-apple-device";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
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

  const sendResetEmail = async (
    data: z.infer<typeof forgottenPasswordFormSchema>,
  ) => {};
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
                      placeholder="you@emaple.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            <AnimatedButton
              isLoading={false}
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
