"use client";

import { userGroup } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";
import useUserStore from "@/store/user-info-store";
import { Plus, SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import NoContent from "../ui/no-content";
import CreateGroupForm from "./create-group-form";

const GroupCard = React.memo(
  ({ group, userAvatarUrl }: { group: userGroup; userAvatarUrl?: string }) => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex flex-row items-center justify-between gap-16">
          {group.groupName}
          <Link href={`/group/${encodeURIComponent(group.groupId)}`}>
            <SquareArrowOutUpRight className="size-4 text-primary" />
          </Link>
        </CardTitle>
        <CardDescription className="flex flex-row items-center justify-between gap-1">
          <span className="flex flex-row gap-1">
            <Avatar className="size-5">
              <AvatarImage src={userAvatarUrl} alt={group.groupName} />
              <AvatarFallback>{group.groupName[0]}</AvatarFallback>
            </Avatar>
            {group.userNameInGroup}
          </span>
          <span>{timeAgo(group.updatedAt)}</span>
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
        <Button
          size="icon"
          className="fixed bottom-4 right-4 size-10 rounded-full md:size-12"
        >
          <Plus className="size-5 md:size-6" />
        </Button>
      </CreateGroupForm>
    </div>
  );
};

export default HomePage;
