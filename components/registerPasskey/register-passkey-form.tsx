"use client";

import {
  finishServerPasskeyRegistration,
  startServerPasskeyRegistration,
} from "@/server/passkey_actions";
import useUserInfoStore from "@/store/user-info-store";
import { create, CredentialCreationOptionsJSON } from "@github/webauthn-json";
import { useMutation } from "@tanstack/react-query";
import { ChevronLast, Info, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { GoPasskeyFill } from "react-icons/go";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

import PasskeyLogo from "../ui/passkey-logo";
import { AnimatedSpinner } from "../ui/spinner";

const RegisterPasskey = () => {
  const router = useRouter();

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
      toast.success("Passkey registered", {
        id: context.toastId,
      });

      return router.replace("/");
    },
    onError: (error, variables, context) => {
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
    <Card className="max-w-sm border-0">
      <CardHeader className="text-center">
        <CardTitle className="text-center text-2xl font-semibold tracking-tight text-foreground/90 md:text-3xl">
          Create Passkey
        </CardTitle>
        <CardDescription>
          Passkeys are a simple and secure way to authenticate using biometrics,
          a hardware key, or PIN.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PasskeyLogo className="mb-8 mt-2 flex w-full items-center" />
        <div className="flex flex-col gap-4">
          <Button
            onClick={handleRegisterPasskey}
            className="flex items-center justify-center space-x-2"
            disabled={isPending}
          >
            {isPending ? (
              <AnimatedSpinner className="mr-2" />
            ) : (
              <GoPasskeyFill className="mr-2 h-5 w-5" />
            )}
            Register a new passkey
          </Button>
          <Link href="/">
            <Button
              variant="outline"
              className="flex w-full items-center justify-center"
              disabled={isPending}
            >
              <ChevronLast className="mr-1 size-5" />
              Skip
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegisterPasskey;
