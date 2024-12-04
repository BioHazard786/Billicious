"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CURRENCIES } from "@/constants/items";
import { userGroup } from "@/lib/types";
import { cn, formatUserGroupsData, timeAgo } from "@/lib/utils";
import { deleteGroup, fetchUserGroupsData } from "@/server/fetchHelpers";
import useUserGroupsDataStore from "@/store/user-groups-data-store";
import useUserStore from "@/store/user-info-store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, SquareArrowOutUpRight, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import AnimatedButton from "../ui/animated-button";
import { AspectRatio } from "../ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { GridPattern } from "../ui/grid-pattern";
import NoContent from "../ui/no-content";

import CreateGroupForm from "./create-group-form";

const GroupCard = ({
  group,
  userAvatarUrl,
}: {
  group: userGroup;
  userAvatarUrl?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const deleteUserGroup = useUserGroupsDataStore(
    (state) => state.deleteUserGroup,
  );
  const currencySymbol = useMemo(
    () => CURRENCIES[group.currencyCode || "INR"].currencySymbol,
    [group.currencyCode],
  );

  const { isPending, mutateAsync: server_deleteGroup } = useMutation({
    mutationFn: deleteGroup,
    onMutate: () => {
      const toastId = toast.loading(`Deleting ${group.groupName} group...`);
      return { toastId };
    },
    onSuccess: async (data, variables, context) => {
      deleteUserGroup(group.groupId);
      return toast.success(`${group.groupName} deleted successfully`, {
        id: context.toastId,
      });
    },
    onError: (error, variables, context) => {
      console.log(error);
      return toast.error(error.message, {
        id: context?.toastId,
      });
    },
    onSettled: () => {
      setIsOpen(false);
    },
  });

  const handleDeleteGroup = async () => {
    await server_deleteGroup(group.groupId);
  };

  const balanceText =
    group.balance < 0
      ? `-${currencySymbol}${(-group.balance).toFixed(2)}`
      : `${currencySymbol}${group.balance.toFixed(2)}`;

  return (
    <div>
      <AspectRatio
        ratio={20 / 9}
        className="relative flex items-center justify-center overflow-hidden rounded-none rounded-t-xl border border-b-0 bg-muted"
      >
        {group.backgroundUrl ? (
          <Image
            src={group.backgroundUrl}
            alt={group.groupName}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div>
            <span className="z-10 max-w-full truncate text-2xl font-bold text-secondary-foreground md:text-3xl lg:text-4xl">
              #{group.groupName}
            </span>
            <GridPattern
              squares={[
                [4, 4],
                [5, 1],
                [8, 2],
                [5, 3],
                [5, 5],
                [10, 10],
                [12, 15],
                [15, 10],
                [10, 15],
                [15, 10],
                [10, 15],
                [15, 10],
              ]}
              className={cn(
                "[mask-image:radial-gradient(200px_circle_at_center,white,transparent)]",
                "md:[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
                "lg:[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
                "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
              )}
            />
          </div>
        )}
      </AspectRatio>
      <Card className="w-full rounded-none border-t-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="max-w-40 truncate">{group.groupName}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {timeAgo(group.updatedAt)}
            </span>
          </CardTitle>
          <CardDescription className="flex flex-row items-center justify-between gap-1">
            <span className="flex flex-row gap-1">
              <Avatar className="size-5">
                <AvatarImage src={userAvatarUrl} alt={group.userNameInGroup} />
                <AvatarFallback>{group.userNameInGroup[0]}</AvatarFallback>
              </Avatar>
              {group.userNameInGroup}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          <div className="flex items-center justify-between">
            Total Expense:{" "}
            <span className="font-mono">
              {currencySymbol}
              {group.totalExpense.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            Total Paid:{" "}
            <span className="font-mono">
              {currencySymbol}
              {group.totalPaid.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            Balance:{" "}
            <span
              className={cn(
                "font-mono",
                group.balance >= 0 ? "text-primary" : "text-destructive",
              )}
            >
              <span>{balanceText}</span>
            </span>
          </div>
        </CardContent>
      </Card>
      {group.isAdmin ? (
        <div className="flex">
          <Button
            className="w-full rounded-none rounded-bl-xl border border-r-0 border-t-0"
            asChild
          >
            <Link href={`/group/${group.groupId}`}>
              View Group <SquareArrowOutUpRight className="ml-2 size-4" />
            </Link>
          </Button>
          <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full rounded-none rounded-br-xl border border-l-0 border-t-0"
                variant="destructive"
              >
                Delete <Trash2 className="ml-2 size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your group and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>
                  Cancel
                </AlertDialogCancel>
                <AnimatedButton
                  isLoading={isPending}
                  variant="destructive"
                  onClick={handleDeleteGroup}
                >
                  Delete
                </AnimatedButton>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        <Button
          className="w-full rounded-none rounded-b-xl border border-t-0"
          asChild
        >
          <Link href={`/group/${group.groupId}`}>
            View Group <SquareArrowOutUpRight className="ml-2 size-4" />
          </Link>
        </Button>
      )}
    </div>
  );
};

const HomePage = () => {
  const user = useUserStore((state) => state.user);
  const userGroups = useUserGroupsDataStore((state) => state.userGroupsData);
  const addUserGroups = useUserGroupsDataStore((state) => state.addUserGroups);
  const query = useQuery({
    queryKey: ["homepage", user!.id],
    queryFn: () => fetchUserGroupsData(user!.id),
    select: (data) => formatUserGroupsData(data.groups),
  });

  const sortedGroups = useMemo(
    () =>
      userGroups
        ? [...userGroups].sort((a, b) => {
            const dateA = new Date(a.updatedAt).getTime();
            const dateB = new Date(b.updatedAt).getTime();
            return dateB - dateA;
          })
        : [],
    [userGroups],
  );

  useEffect(() => {
    if (query.data) {
      addUserGroups(query.data);
    }
  }, [query.data]);

  if (userGroups.length === 0) {
    return (
      <div className="grid min-h-screen w-full place-items-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <NoContent className="size-32 md:size-48" />
          <div className="text-center text-sm text-muted-foreground md:text-base">
            No Groups here.
            <br />
            Click button to add one
          </div>
          <CreateGroupForm>
            <div className="blob relative size-16 md:size-20">
              <span></span>
              <span></span>
              <span></span>
              <span className="absolute inset-0 -z-[40] rounded-lg bg-primary opacity-40 blur-xl"></span>
              <Button size="icon" className="size-16 rounded-full md:size-20">
                <Plus className="size-6 md:size-7" />
              </Button>
            </div>
          </CreateGroupForm>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 p-3 pt-[4.063rem] md:grid-cols-2 lg:grid-cols-3">
        {sortedGroups.map((group) => (
          <GroupCard
            key={group.groupId}
            group={group}
            userAvatarUrl={user?.avatar_url}
          />
        ))}
      </div>
      <CreateGroupForm>
        <div className="fixed bottom-4 right-4 z-20 size-16 md:size-20">
          <div className="blob relative">
            <span></span>
            <span></span>
            <span></span>
            <span className="absolute inset-0 -z-[40] rounded-lg bg-primary opacity-40 blur-xl"></span>
            <Button size="icon" className="size-16 rounded-full md:size-20">
              <Plus className="size-6 md:size-7" />
            </Button>
          </div>
        </div>
      </CreateGroupForm>
    </div>
  );
};

export default HomePage;
