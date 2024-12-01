"use client";

import { passwordSchema } from "@/lib/schema";
import { updatePassword } from "@/server/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
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
import { Form } from "../ui/form";
import { PasswordStrengthField } from "../ui/password-input";
import { Separator } from "../ui/separator";

const UpdatePassword = () => {
  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
    },
  });

  const { isPending, mutate: server_updatePassword } = useMutation({
    mutationFn: updatePassword,
    onMutate: () => {
      const toastId = toast.loading("Updating password...");
      return { toastId };
    },
    onSuccess: (data, variables, context) => {
      if (data?.error) {
        return toast.error(data?.error, {
          id: context?.toastId,
        });
      }
      return toast.success(
        "Password updated successfully. You will be redirected to the app",
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

  const sendResetEmail = (data: z.infer<typeof passwordSchema>) => {
    server_updatePassword(data);
  };

  return (
    <Card className="mx-auto w-full max-w-sm space-y-6 border-0 px-1">
      <CardHeader>
        <CardTitle className="mt-6 text-center text-2xl font-semibold tracking-tight text-foreground/90 md:text-3xl">
          Update Your Password
        </CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground">
          Choose a strong password with at least 8 characters, including
          uppercase letters, and numbers
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(sendResetEmail)}
            className="space-y-4"
          >
            <PasswordStrengthField />
            <Separator />
            <AnimatedButton
              isLoading={isPending}
              variant="default"
              className="w-full"
            >
              Update Password
            </AnimatedButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UpdatePassword;
