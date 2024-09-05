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
import useContributionsTabStore from "@/store/contributions-tab-store";
import useDashboardStore from "@/store/dashboard-store";

const ContributionsTab = () => {
  const members = useDashboardStore((group) => group.members);
  return (
    <>
      <DialogHeader className="hidden pb-4 md:block">
        <DialogTitle>Contributions</DialogTitle>
        <DialogDescription>
          Enter the group cost of this expense
        </DialogDescription>
      </DialogHeader>
      <DrawerHeader className="pb-4 md:hidden">
        <DrawerTitle>Contributions</DrawerTitle>
        <DrawerDescription>
          Enter the group cost of this expense
        </DrawerDescription>
      </DrawerHeader>
      <ScrollArea className="h-[300px]">
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
  const [payee, setPayee, deletePayee] = useContributionsTabStore((state) => [
    state.payees,
    state.setPayees,
    state.deletePayee,
  ]);
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarFallback>{memberName[0]}</AvatarFallback>
        </Avatar>
        <p className="text-sm">{memberName}</p>
      </div>
      <div className="flex items-center justify-end gap-2">
        <p className="w-min text-sm">₹</p>
        <Input
          className="w-[60%]"
          type="number"
          value={payee[memberIndex] || ""}
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
