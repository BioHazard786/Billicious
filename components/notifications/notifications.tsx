"use client";

import { type Notifications } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { acceptInvite, declineInvite } from "@/server/fetchHelpers";
import useNotificationStore from "@/store/notification-store";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { IoNotifications } from "react-icons/io5";
import { toast } from "sonner";
import AnimatedButton from "../ui/animated-button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import NoContent from "../ui/no-content";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Separator } from "../ui/separator";

const Notifications = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  const [open, setIsOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <IoNotifications className="size-5" />
          {notifications.length > 0 && (
            <span className="absolute right-0 top-0 flex size-[0.6rem]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex size-[0.6rem] rounded-full bg-primary"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[100] w-[22rem] p-0 md:w-[30rem]">
        <div className="space-y-1 p-4">
          <h4 className="font-semibold leading-none">Notifications</h4>
          {notifications.length > 0 && (
            <p className="text-sm text-muted-foreground">{`You have ${notifications.length} invites`}</p>
          )}
        </div>
        <Separator />
        {notifications.length > 0 ? (
          <div className="custom-scrollbar max-h-[25rem] overflow-y-auto md:max-h-[40rem]">
            <AnimatePresence mode="popLayout">
              {notifications.map((notification, index) => (
                <motion.div
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring" }}
                  layout
                  key={`notification-${index}`}
                >
                  <NotificationCard
                    notification={notification}
                    setIsOpen={setIsOpen}
                  />
                  {index !== notifications.length - 1 && <Separator />}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
            <NoContent className="size-24 md:size-40" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium md:text-base">
                A Lonely Loner Like Me
              </p>
              <p className="text-sm text-muted-foreground md:text-base">
                You haven't recieved any notifications yet
              </p>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

const NotificationCard = ({
  notification,
  setIsOpen,
}: {
  notification: Notifications[0];
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const removeNotification = useNotificationStore(
    (state) => state.removeNotification,
  );

  const { isPending: isAcceptInvitePending, mutate: handleAcceptInvite } =
    useMutation({
      mutationFn: acceptInvite,
      onMutate: () => {
        const toastId = toast.loading(
          `Joining you in ${notification.groupName}...`,
        );
        return { toastId };
      },
      onSuccess: (data, variables, context) => {
        router.push(`/group/${encodeURIComponent(notification.groupId!)}`);
        removeNotification(notification.notificationId);
        return toast.success(`Joined ${notification.groupName} successfully`, {
          id: context.toastId,
        });
      },
      onError: (error, variables, context) => {
        return toast.error(error.message, {
          id: context?.toastId,
        });
      },
      onSettled: () => {
        setIsOpen(false);
      },
    });

  const { isPending: isDeclineInvitePending, mutate: handleDeclineInvite } =
    useMutation({
      mutationFn: declineInvite,
      onMutate: () => {
        const toastId = toast.loading(`Deleting invite...`);
        return { toastId };
      },
      onSuccess: (data, variables, context) => {
        removeNotification(notification.notificationId);
        return toast.success(`Deleted successfully`, {
          id: context.toastId,
        });
      },
      onError: (error, variables, context) => {
        return toast.error(error.message, {
          id: context?.toastId,
        });
      },
      onSettled: () => {
        setIsOpen(false);
      },
    });

  return (
    <Card className="w-full border-0 p-4">
      <CardContent className="p-0">
        <div className="flex gap-4">
          <Avatar className="size-11">
            <AvatarImage
              src={notification.senderAvatarUrl || undefined}
              alt={notification.senderName || undefined}
            />
            <AvatarFallback>
              {notification.senderName?.[0] || "B"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-between">
            <p className="text-sm">
              <span className="font-medium">{notification.senderName}</span>{" "}
              asked to join the group{" "}
              <span className="font-medium">{notification.groupName}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {timeAgo(notification.createdAt)}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-start space-x-2 p-0 pt-4">
        <AnimatedButton
          isLoading={isDeclineInvitePending}
          disabled={isDeclineInvitePending || isAcceptInvitePending}
          variant="outline"
          loadingSpanClassName="bg-primary"
          onClick={() =>
            handleDeclineInvite({
              groupId: notification.groupId,
              userId: notification.receiverUserId,
            })
          }
        >
          Decline
        </AnimatedButton>
        <AnimatedButton
          isLoading={isAcceptInvitePending}
          disabled={isDeclineInvitePending || isAcceptInvitePending}
          onClick={() =>
            handleAcceptInvite({
              groupId: notification.groupId,
              userId: notification.receiverUserId,
            })
          }
        >
          Accept
        </AnimatedButton>
      </CardFooter>
    </Card>
  );
};
export default Notifications;
