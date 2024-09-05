import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import useDashboardStore from "@/store/dashboard-store";
import useFeetabStore from "@/store/fee-tab-store";

const FeeTab = () => {
  const members = useDashboardStore((group) => group.members);
  return (
    <>
      <DialogHeader className="pb-4">
        <DialogTitle>Contributions</DialogTitle>
        <DialogDescription>
          Enter the group cost of this expense
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="h-[300px]">
        <div className="grid gap-4 py-4 pr-4">
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
  const [payee, setPayee, deletePayee] = useFeetabStore((state) => [
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
          inputMode="numeric"
          pattern="\d*"
          placeholder="0"
          name="payee-contribution"
        />
      </div>
    </div>
  );
};

export default FeeTab;
