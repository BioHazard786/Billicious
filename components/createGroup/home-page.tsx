"use client";

import { userGroup } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";
import useUserStore from "@/store/user-info-store";
import { Plus, SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";
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
import Logo from "../ui/logo";
import Mascot from "../ui/mascot";
import NoContent from "../ui/no-content";
import CreateGroupForm from "./create-group-form";

const GroupCard = React.memo(
  ({ group, userAvatarUrl }: { group: userGroup; userAvatarUrl?: string }) => (
    <div>
      <AspectRatio
        ratio={20 / 9}
        className="relative overflow-hidden rounded-none rounded-t-xl border border-b-0 bg-muted"
      >
        <Logo className="absolute right-0 top-20 h-24 -rotate-45 text-muted-foreground opacity-50" />
        <Mascot className="absolute size-32 text-muted-foreground opacity-50" />
        <div className="absolute bottom-0 -rotate-45 text-6xl font-bold text-muted-foreground opacity-50">
          #{group.groupName}
        </div>
      </AspectRatio>
      <Card className="w-full rounded-none border-t-0">
        <CardHeader>
          <CardTitle className="flex flex-row items-center justify-between gap-16">
            {group.groupName}
            <span className="text-sm font-normal text-muted-foreground">
              {timeAgo(group.updatedAt)}
            </span>
          </CardTitle>
          <CardDescription className="flex flex-row items-center justify-between gap-1">
            <span className="flex flex-row gap-1">
              <Avatar className="size-5">
                <AvatarImage src={userAvatarUrl} alt={group.groupName} />
                <AvatarFallback>{group.groupName[0]}</AvatarFallback>
              </Avatar>
              {group.userNameInGroup}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="flex items-center justify-between">
            Total Expense:{" "}
            <span className="font-mono">₹{group.totalExpense.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            Total Paid:{" "}
            <span className="font-mono">₹{group.totalPaid.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            Balance:{" "}
            <span
              className={cn(
                "font-mono",
                group.balance >= 0 ? "text-primary" : "text-destructive",
              )}
            >
              <span>₹{group.balance.toFixed(2)}</span>
            </span>
          </div>
        </CardContent>
      </Card>
      <Link href={`/group/${group.groupId}`}>
        <Button className="w-full rounded-none rounded-b-xl border border-t-0">
          View Group <SquareArrowOutUpRight className="ml-2 size-4" />
        </Button>
      </Link>
    </div>
  ),
);

const HomePage = ({ userGroups }: { userGroups: userGroup[] }) => {
  const user = useUserStore((state) => state.user);

  const sortedGroups = useMemo(
    () => [...userGroups].sort((a, b) => b.totalPaid - a.totalPaid),
    [userGroups],
  );

  if (userGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <NoContent className="size-32 md:size-48" />
        <div className="text-center text-sm text-muted-foreground md:text-base">
          No Groups here.
          <br />
          Click button to add one
        </div>
        <CreateGroupForm>
          <Button>Create Group</Button>
        </CreateGroupForm>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 p-3 pt-16 md:grid-cols-2 lg:grid-cols-3">
        {sortedGroups.map((group) => (
          <GroupCard
            key={group.groupId}
            group={group}
            userAvatarUrl={user?.avatar_url}
          />
        ))}
      </div>
      <CreateGroupForm>
        <div className="fixed bottom-4 right-4 size-16 md:size-20">
          <div className="blob relative">
            <span></span>
            <span></span>
            <span className="absolute inset-0 -z-[30] rounded-lg bg-primary opacity-50 blur-lg"></span>
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
