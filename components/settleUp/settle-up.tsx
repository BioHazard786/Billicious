"use client";

import { CURRENCIES } from "@/constants/items";
import { cn } from "@/lib/utils";
import { fetchAllBalances } from "@/server/fetchHelpers";
import useDashboardStore from "@/store/dashboard-store";
import useUserInfoStore from "@/store/user-info-store";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import NoContent from "../ui/no-content";
import { Separator } from "../ui/separator";
import { Spinner } from "../ui/spinner";

type settleUpDataType = {
  groupId: string;
  user1Index: number;
  user2Index: number;
  balance: string;
  createdAt: string;
  updatedAt: string;
};

const SettleUp = async () => {
  const { slug: groupId } = useParams();
  const user = useUserInfoStore((state) => state.user);

  const { data, isLoading } = useQuery<settleUpDataType[]>({
    queryKey: ["settleUp", user?.id, groupId as string],
    queryFn: () => fetchAllBalances(groupId as string),
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center [@supports(height:100dvh)]:h-dvh">
        <Spinner
          loadingSpanClassName="bg-muted-foreground"
          className="size-6 md:size-7 lg:size-8"
        />
      </div>
    );
  }

  if (data?.length === 0) {
    return (
      <Card className="m-3 mb-[5.25rem] mt-16 lg:mb-3 lg:ml-[4.2rem]">
        <CardHeader>
          <CardTitle>Settle Up</CardTitle>
          <CardDescription>
            Settle up your group's balances here
          </CardDescription>
        </CardHeader>

        <CardContent className="flex h-full flex-col items-center justify-center gap-4">
          <NoContent className="size-32 md:size-48" />
          <div className="text-sm text-muted-foreground md:text-base">
            No debts here. Click + to add transactions
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="m-3 mb-[5.25rem] mt-16 lg:mb-3 lg:ml-[4.2rem]">
      <CardHeader>
        <CardTitle>Settle Up</CardTitle>
        <CardDescription>Settle up your group's balances here</CardDescription>
      </CardHeader>
      <CardContent>
        {data?.map((settleUpData, index) => (
          <>
            <Debt
              key={`debt-${index}`}
              senderIndex={settleUpData.user2Index}
              receiverIndex={settleUpData.user1Index}
              balance={settleUpData.balance}
            />
            <Separator className="my-4 last:hidden" />
          </>
        ))}
      </CardContent>
    </Card>
  );
};

const Debt = ({
  receiverIndex,
  senderIndex,
  balance,
}: {
  receiverIndex: number;
  senderIndex: number;
  balance: string;
}) => {
  const members = useDashboardStore((state) => state.members);
  const currencyCode = useDashboardStore((state) => state.currencyCode);
  const currencySymbol = useMemo(
    () => CURRENCIES[currencyCode || "INR"].currencySymbol,
    [currencyCode],
  );
  const receiver = members[receiverIndex];
  const sender = members[senderIndex];

  return (
    <div className="flex flex-wrap items-center gap-2 px-2 text-sm">
      <span className="flex items-center gap-2 text-nowrap">
        <Avatar className="relative size-6">
          <AvatarImage src={sender.avatarUrl} alt={sender.name} />
          {sender.status === 1 && sender.avatarUrl && (
            <div
              className={cn(
                "absolute inset-0 rounded-full",
                "bg-black/50",
                "pointer-events-none",
              )}
            />
          )}
          <AvatarFallback className="text-xs">{sender.name[0]}</AvatarFallback>
        </Avatar>
        <span className="font-medium">{sender.name}</span>
      </span>
      <span>should pay</span>
      <span className="font-medium text-destructive">
        {currencySymbol}
        {parseFloat(balance).toFixed(2)}
      </span>
      <span>back to</span>
      <span className="flex items-center gap-2 text-nowrap">
        <Avatar className="relative size-6">
          <AvatarImage src={receiver.avatarUrl} alt={receiver.name} />
          {receiver.status === 1 && receiver.avatarUrl && (
            <div
              className={cn(
                "absolute inset-0 rounded-full",
                "bg-black/50",
                "pointer-events-none",
              )}
            />
          )}
          <AvatarFallback className="text-xs">
            {receiver.name[0]}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{receiver.name}</span>
      </span>
    </div>
  );
};

export default SettleUp;
