import { Button } from "@/components/ui/button";
import { Eye, Home } from "lucide-react";
import Link from "next/link";
import Stop from "../ui/stop";

type NotAllowedProps = {
  groupId?: string;
  memberStatus: number;
  customTitle?: string;
  customMessage?: string;
};

export default function NotAllowed({
  groupId,
  memberStatus,
  customTitle,
  customMessage,
}: NotAllowedProps) {
  const content = {
    title:
      customTitle ||
      (memberStatus === 0 ? "Access Not Allowed" : "Invitation Required"),
    message:
      customMessage ||
      (memberStatus === 0
        ? "Oops! You are not allowed to access this group as you are not a member. Please check the group details or contact an admin for assistance."
        : "You have been invited to this group. Please check your notifications to accept the invitation before accessing the group."),
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <div className="space-y-6 text-center">
        <h1 className="flex items-center justify-center gap-2 text-8xl font-extrabold md:text-9xl">
          <Stop className="size-32 md:size-48" />
        </h1>
        <h2 className="text-2xl font-semibold md:text-4xl">{content.title}</h2>
        <p className="max-w-lg text-sm text-muted-foreground md:text-base">
          {content.message}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild className="mt-8">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go back home
            </Link>
          </Button>
          {groupId && (
            <Button asChild className="mt-8">
              <Link href={`/view/group/${encodeURIComponent(groupId)}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Group
              </Link>
            </Button>
          )}
        </div>
      </div>
      <div className="mt-16 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Billicious. All rights reserved.
      </div>
    </div>
  );
}
