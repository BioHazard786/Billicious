"use client";

import { createClient } from "@/auth-utils/client";
import { useMediaQuery } from "@/hooks/use-media-query";
import { type Notifications } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import {
  acceptInvite,
  declineInvite,
  fetchUserGroupInfo,
} from "@/server/fetchHelpers";
import useNotificationStore from "@/store/notification-store";
import useUserInfoStore from "@/store/user-info-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { IoNotifications } from "react-icons/io5";
import { toast } from "sonner";
import AnimatedButton from "../ui/animated-button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import NoContent from "../ui/no-content";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

const Notifications = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );
  const removeNotification = useNotificationStore(
    (state) => state.removeNotification,
  );
  const [open, setIsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const supabase = useMemo(() => createClient(), []);
  const user = useUserInfoStore((state) => state.user);

  const { mutateAsync: server_fetchNewNotifications } = useMutation({
    mutationFn: fetchUserGroupInfo,
    onSuccess: (data) => {
      toast.info(`New invite from ${data.user.name} for ${data.group.name}`);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("realtime notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "invite_table",
          filter: `receiver_user_id=eq.${user?.id}`,
        },
        async (payload) => {
          const info = await server_fetchNewNotifications({
            userId: payload.new.sender_user_id,
            groupId: payload.new.group_id,
          });
          if (info) {
            const notification: Notifications[0] = {
              id: payload.new.id,
              senderUserId: payload.new.sender_user_id,
              receiverUserId: payload.new.receiver_user_id,
              groupId: payload.new.group_id,
              userIndex: payload.new.user_index,
              createdAt: new Date(payload.new.created_at + "Z"),
              groupName: info.group.name,
              groupBackgroundUrl: info.group.backgroundUrl,
              senderName: info.user.name,
              senderAvatarUrl: info.user.avatarUrl,
            };
            addNotification(notification);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "invite_table",
        },
        async (payload) => {
          removeNotification(payload.old.id);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isDesktop)
    return (
      <Popover open={open} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative size-8">
            <IoNotifications className="size-5" />
            {notifications.length > 0 && (
              <span className="absolute right-0 top-0 flex size-[0.6rem]">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex size-[0.6rem] rounded-full bg-primary"></span>
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="z-[100] w-[22rem] p-0 md:w-[30rem]"
          align="end"
          alignOffset={-10}
        >
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

  return (
    <Drawer open={open} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-8">
          <IoNotifications className="size-5" />
          {notifications.length > 0 && (
            <span className="absolute right-0 top-0 flex size-[0.6rem]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex size-[0.6rem] rounded-full bg-primary"></span>
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="z-[101]" hidden={true}>
        <DrawerHeader>
          <DrawerTitle>Notifications</DrawerTitle>
          <DrawerDescription>
            {notifications.length > 0
              ? `You have ${notifications.length} invites`
              : ""}
          </DrawerDescription>
        </DrawerHeader>
        {notifications.length > 0 ? (
          <ScrollArea className="max-h-[25rem] overflow-y-auto">
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
          </ScrollArea>
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
      </DrawerContent>
    </Drawer>
  );
};

const NotificationCard = ({
  notification,
  setIsOpen,
}: {
  notification: Notifications[0];
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const admin = useUserInfoStore((state) => state.user);
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
        queryClient.refetchQueries({
          queryKey: ["homepage", admin!.id],
          exact: true,
        });
        router.push(`/group/${encodeURIComponent(notification.groupId!)}`);
        removeNotification(notification.id);
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
        removeNotification(notification.id);
        return toast.success(`Deleted successfully`, {
          id: context.toastId,
        });
      },
      onError: (error, variables, context) => {
        return toast.error(error.message, {
          id: context?.toastId,
        });
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
              <span className="font-semibold">{notification.senderName}</span>{" "}
              asked to join the group{" "}
              <span className="font-semibold">{notification.groupName}</span>
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
              userIndex: notification.userIndex,
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
        <Button asChild variant="link">
          <Link
            href={`/view/group/${encodeURIComponent(notification.groupId!)}`}
          >
            View Group
            <SquareArrowOutUpRight className="ml-2 size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
export default Notifications;
