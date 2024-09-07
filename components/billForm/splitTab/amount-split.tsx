import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import useDashboardStore from "@/store/dashboard-store";
import useSplitTabStore from "@/store/split-tab-store";
import React from "react";

const AmountSplit = ({ payeeBill }: { payeeBill: number }) => {
  const members = useDashboardStore((group) => group.members);
  return (
    <div className="grid gap-4">
      {members.map((member, index) => (
        <DraweeInput
          key={`drawee-list-${index}`}
          memberName={member.name}
          memberIndex={member.memberIndex}
        />
      ))}
    </div>
  );
};

const DraweeInput = ({
  memberName,
  memberIndex,
}: {
  memberName: string;
  memberIndex: string;
}) => {
  const { draweeAmount } = useSplitTabStore((state) => state);
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarFallback>{memberName[0]}</AvatarFallback>
        </Avatar>
        <p className="w-14 truncate text-sm md:w-32">{memberName}</p>
      </div>
      <div className="flex items-center justify-end gap-2">
        <p className="w-min text-sm">₹</p>
        <Input
          className="w-[70%]"
          type="number"
          value={draweeAmount[memberIndex] ?? ""}
          onChange={(e) => {}}
          onKeyDown={(e) => {
            if (
              e.key === "e" ||
              e.key === "E" ||
              e.key === "+" ||
              e.key === "-"
            ) {
              e.preventDefault();
            }
          }}
          onWheel={(e) => (e.target as HTMLElement).blur()}
          inputMode="numeric"
          pattern="\d*"
          placeholder="0"
          name="drawee-split-by-amount"
        />
      </div>
    </div>
  );
};

export default AmountSplit;
