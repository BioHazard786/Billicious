import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, isAppleDevice } from "@/lib/utils";
import useContributionsTabStore from "@/store/contributions-tab-store";
import useDashboardStore from "@/store/dashboard-store";
import AnimatedCounter from "../ui/animated-counter";

const ContributionsTab = () => {
  const members = useDashboardStore((group) => group.members);
  const payeesBill = useContributionsTabStore.use.payeesBill();
  return (
    <>
      <DialogHeader className="hidden pb-4 md:block">
        <DialogTitle>Contributions</DialogTitle>
        <DialogDescription className="flex gap-1">
          Total Contributions:{" "}
          <span className="flex">
            <span className="mr-[0.1rem]">₹</span>
            <AnimatedCounter
              value={payeesBill}
              precision={2}
              className="font-mono"
            />
          </span>
        </DialogDescription>
      </DialogHeader>
      <DrawerHeader className="pb-4 md:hidden">
        <DrawerTitle>Contributions</DrawerTitle>
        <DrawerDescription className="flex justify-center gap-1">
          Total Contributions:{" "}
          <span className="flex">
            <span className="mr-[0.1rem]">₹</span>
            <AnimatedCounter
              value={payeesBill}
              precision={2}
              className="font-mono"
            />
          </span>
        </DrawerDescription>
      </DrawerHeader>
      <ScrollArea className="h-[40vh] md:h-[300px]">
        <div className="grid gap-4 p-4 md:px-0 md:pr-4">
          {members.map((member, index) => (
            <PayeeInputAmount
              key={`payee-list-${index}`}
              memberName={member.name}
              memberIndex={member.memberIndex}
            />
          ))}
        </div>
      </ScrollArea>
    </>
  );
};

const PayeeInputAmount = ({
  memberName,
  memberIndex,
}: {
  memberName: string;
  memberIndex: string;
}) => {
  const isApple = isAppleDevice();
  const payees = useContributionsTabStore.use.payees();
  const setPayee = useContributionsTabStore.use.setPayee();
  const deletePayee = useContributionsTabStore.use.deletePayee();
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
          className={cn("w-[70%]", isApple ? "text-base" : "")}
          type="number"
          value={payees[memberIndex] || ""}
          onChange={(e) => {
            if (e.target.value === "0" || e.target.value === "")
              deletePayee(memberIndex);
            else setPayee(memberIndex, Number(e.target.value));
          }}
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
          name="payee-contribution"
        />
      </div>
    </div>
  );
};

export default ContributionsTab;
