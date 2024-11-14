"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { userGroup } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";
import useUserStore from "@/store/user-info-store";
import { Plus, SquareArrowOutUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";
import { LabelList, RadialBar, RadialBarChart } from "recharts";
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
import GridPattern from "../ui/grid-patterm";
import NoContent from "../ui/no-content";
import CreateGroupForm from "./create-group-form";

const GroupCard = React.memo(
  ({ group, userAvatarUrl }: { group: userGroup; userAvatarUrl?: string }) => {
    const chartData = [
      {
        moneyType: "expenses",
        value: group.totalExpense,
        fill: "var(--color-expenses)",
      },
      { moneyType: "paid", value: group.totalPaid, fill: "var(--color-paid)" },
      {
        moneyType: "balance",
        value: group.balance,
        fill: "var(--color-balance)",
      },
    ];

    const chartConfig = {
      value: {
        label: "Value",
      },
      expenses: {
        label: "Total Expenses",
        color: "hsl(var(--chart-1))",
      },
      paid: {
        label: "Total Paid",
        color: "hsl(var(--chart-2))",
      },
      balance: {
        label: "Balance",
        color: "hsl(var(--chart-3))",
      },
    } satisfies ChartConfig;

    return (
      <div>
        <AspectRatio
          ratio={20 / 9}
          className="flex items-center justify-center overflow-hidden rounded-none rounded-t-xl border border-b-0 bg-muted"
        >
          <div className="z-10 text-5xl font-bold text-secondary-foreground">
            #{group.groupName}
          </div>
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
              "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
              "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
            )}
          />
          {/* <Image
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAE9ExQiOPbNqS6c2T1XZ0Gf25DKbEitpS2A&s"
            alt="Photo by Drew Beamer"
            fill
            className="h-full w-full object-cover"
          /> */}
        </AspectRatio>
        <Card className="w-full rounded-none border-t-0">
          <CardHeader className="pb-0">
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
          <CardContent className="py-0 text-sm">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <RadialBarChart
                data={chartData}
                startAngle={-90}
                endAngle={380}
                innerRadius={30}
                outerRadius={110}
              >
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent hideLabel nameKey="moneyType" />
                  }
                />
                <RadialBar dataKey="value" cornerRadius={10} background>
                  <LabelList
                    position="insideStart"
                    dataKey="moneyType"
                    className="fill-white capitalize mix-blend-luminosity"
                    fontSize={11}
                  />
                </RadialBar>
              </RadialBarChart>
            </ChartContainer>
            {/* <div className="flex items-center justify-between">
              Total Expense:{" "}
              <span className="font-mono">
                ₹{group.totalExpense.toFixed(2)}
              </span>
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
            </div> */}
          </CardContent>
        </Card>
        <Link href={`/group/${group.groupId}`}>
          <Button className="w-full rounded-none rounded-b-xl border border-t-0">
            View Group <SquareArrowOutUpRight className="ml-2 size-4" />
          </Button>
        </Link>
      </div>
    );
  },
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
