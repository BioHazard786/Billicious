"use client";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { passkeyRegistered } from "@/server/actions";
import {
  finishServerPasskeyRegistration,
  startServerPasskeyRegistration,
} from "@/server/passkey_actions";
import useUserInfoStore from "@/store/user-info-store";
import { create, CredentialCreationOptionsJSON } from "@github/webauthn-json";
import { useMutation } from "@tanstack/react-query";
import { ChevronLast, Info } from "lucide-react";
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

import PasskeyAnimation from "../ui/passkey_animation";
import Spinner from "../ui/spinner";

const RegisterPasskey = () => {
  const user = useUserInfoStore((state) => state.user);
  const router = useRouter();
  const setHasPasskeys = useUserInfoStore((state) => state.setHasPasskeys);

  //   if (user?.has_passkey) router.replace("/");

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
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-2xl">
          <div>Register Passkey</div>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Info className="size-5 text-muted-foreground" />
            </HoverCardTrigger>
            <HoverCardContent className="text-sm font-normal text-muted-foreground">
              Passkeys replace passwords and allow users to login with, e.g.
              Face ID or Touch ID, instead of passwords. They are a secure and
              convenient form of passwordless authentication and
              2-factor-authentication (2FA).
            </HoverCardContent>
          </HoverCard>
        </CardTitle>
        <CardDescription>
          To make sign in seamless. You can always register in settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PasskeyAnimation />
        <div className="flex flex-col gap-4">
          <Button
            onClick={() => handleRegisterPasskey(user!.id)}
            className="flex items-center justify-center space-x-2"
            disabled={isPending}
          >
            {isPending ? (
              <Spinner loadingSpanClassName="bg-primary" className="mr-2" />
            ) : (
              <GoPasskeyFill className="mr-2 h-5 w-5" />
            )}
            Register a new passkey
          </Button>
          <Link href="/">
            <Button
              variant="link"
              className="flex w-full items-center justify-center"
              disabled={isPending}
            >
              Skip
              <ChevronLast className="ml-1 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegisterPasskey;
