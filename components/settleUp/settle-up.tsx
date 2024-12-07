"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES } from "@/constants/items";
import { cn } from "@/lib/utils";
import { fetchAllBalances } from "@/server/fetchHelpers";
import useDashboardStore from "@/store/dashboard-store";
import { useQuery } from "@tanstack/react-query";
import { ChevronsRight } from "lucide-react";
import { useParams } from "next/navigation";
import { Fragment, useMemo, useState } from "react";
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
import Split from "../ui/split";

type settleUpDataType = {
  groupId: string;
  user1Index: number;
  user2Index: number;
  balance: string;
  createdAt: string;
  updatedAt: string;
};

const SettleUp = () => {
  const { slug: groupId } = useParams();
  const { data, isLoading } = useQuery<settleUpDataType[]>({
    queryKey: ["settleUp", groupId as string],
    queryFn: () => fetchAllBalances(groupId as string),
  });

  const members = useDashboardStore((state) => state.members);
  const [selectedMember, setSelectedMember] = useState<string | undefined>(
    undefined,
  );

  const filteredData = useMemo(() => {
    if (!selectedMember || selectedMember === "all") return data;
    return data?.filter(
      (settleUpData) => settleUpData.user2Index.toString() === selectedMember,
    );
  }, [data, selectedMember]);

  return (
    <Card className="m-3 mb-[5.563rem] mt-[4.063rem] lg:mb-3 lg:ml-[4.313rem]">
      <CardHeader>
        <CardTitle>Settle Up</CardTitle>
        <CardDescription>
          Clear your group’s balances effortlessly. Review, settle, and keep
          everything fair and square
        </CardDescription>
        {data && data.length > 0 && (
          <Select
            onValueChange={setSelectedMember}
            value={selectedMember}
            defaultValue="all"
          >
            <SelectTrigger className="w-full md:w-60">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Members</SelectLabel>
                <SelectItem value="all">
                  <div className="flex items-center">
                    <Avatar className="size-7">
                      <AvatarFallback className="text-xs">A</AvatarFallback>
                    </Avatar>
                    <div className="ml-2 flex flex-col items-start">
                      <span>All Members</span>
                    </div>
                  </div>
                </SelectItem>
                {members.map((member, index) => (
                  <SelectItem
                    value={member.memberIndex}
                    key={`select-member-${index}`}
                  >
                    <div className="flex items-center">
                      <Avatar className="size-7">
                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                        <AvatarFallback className="text-xs">
                          {member.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-2 flex flex-col items-start">
                        <span>{member.name}</span>
                        {member.username && (
                          <span className="text-xs text-muted-foreground">
                            @{member.username}
                          </span>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex w-full items-center justify-center">
            <Spinner
              loadingSpanClassName="bg-muted-foreground"
              className="size-6 md:size-6 lg:size-7"
            />
          </div>
        )}
        {filteredData?.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <Split className="size-32 md:size-48" />
            <div className="space-y-1 text-center">
              <p className="text-lg font-semibold md:text-xl">
                All Squared Away!
              </p>
              <p className="text-sm text-muted-foreground md:text-base">
                Looks like there’s nothing to settle up right now. Time to relax
                until the next split comes around!
              </p>
            </div>
          </div>
        ) : (
          filteredData?.map((settleUpData, index) => (
            <Fragment key={`debt-${index}`}>
              <Debt
                senderIndex={settleUpData.user2Index}
                receiverIndex={settleUpData.user1Index}
                balance={settleUpData.balance}
              />
              <Separator className="my-4 last:hidden" />
            </Fragment>
          ))
        )}
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
        <Avatar className="relative size-7">
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
      <span className="font-mono font-medium text-destructive">
        {currencySymbol}
        {parseFloat(balance).toFixed(2)}
      </span>
      <ChevronsRight className="size-5" />
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
