import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAppleDevice } from "@/hooks/use-apple-device";
import {
  modifyDraweeAmount,
  recalculatePayeesBills,
  removeDraweeAmount,
  removeDraweePercent,
} from "@/lib/split-tab-utils";
import { cn } from "@/lib/utils";
import useContributionsTabStore from "@/store/contributions-tab-store";
import useDashboardStore from "@/store/dashboard-store";
import useSplitByAmountTabStore from "@/store/split-by-amount-tab-store";
import useSplitByPercentTabStore from "@/store/split-by-percent-tab-store";
import useSplitEquallyTabStore from "@/store/split-equally-tab-store";
import { toast } from "sonner";

const AmountSplit = () => {
  const members = useDashboardStore((group) => group.members);
  return (
    <div className="grid gap-4">
      {members.map((member, index) => (
        <DraweeInput
          key={`drawee-input-${index}`}
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
  const isApple = useAppleDevice().isAppleDevice;
  const payeesBill = useContributionsTabStore.getState().payeesBill;
  const payees = useContributionsTabStore.getState().payees;
  const setMultiplePayees =
    useContributionsTabStore.getState().setMultiplePayees;
  const drawees = useSplitEquallyTabStore.getState().drawees;
  const removeDrawees = useSplitEquallyTabStore.getState().removeDrawees;
  const draweesSplitByPercent =
    useSplitByPercentTabStore.getState().draweesSplitByPercent;
  const setDraweesSplitByPercent =
    useSplitByPercentTabStore.getState().setDraweesSplitByPercent;
  const [
    draweesSplitByAmount,
    isErroredOut,
    setDraweesSplitByAmount,
    setIsError,
  ] = useSplitByAmountTabStore((state) => [
    state.draweesSplitByAmount,
    state.isErroredOut,
    state.setDraweesSplitByAmount,
    state.setIsError,
  ]);

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
          value={
            draweesSplitByAmount.get(memberIndex)
              ? Math.floor(
                  draweesSplitByAmount.get(memberIndex)!.amount * 100,
                ) / 100
              : ""
          }
          onChange={(e) => {
            if (e.target.value === "0" || e.target.value === "") {
              if (draweesSplitByAmount.size <= 1) {
                return toast.error("Drawee amount should not be empty");
              }
              if (drawees.includes(memberIndex)) {
                removeDrawees(memberIndex);
              }
              if (draweesSplitByAmount.has(memberIndex)) {
                setDraweesSplitByAmount(
                  removeDraweeAmount(
                    memberIndex,
                    new Map(draweesSplitByAmount),
                    payeesBill,
                  ),
                );
              }
              if (draweesSplitByPercent.has(memberIndex)) {
                setDraweesSplitByPercent(
                  removeDraweePercent(
                    memberIndex,
                    new Map(draweesSplitByPercent),
                  ),
                );
              }
            } else {
              if (isErroredOut) {
                const draweeAmountState = new Map(draweesSplitByAmount);
                draweeAmountState.set(memberIndex, {
                  amount: Number(e.target.value),
                  isEdited: true,
                });
                recalculatePayeesBills(
                  payees,
                  draweeAmountState,
                  payeesBill,
                  setMultiplePayees,
                );
                setDraweesSplitByAmount(draweeAmountState);
              } else {
                const { draweeAmountState, error } = modifyDraweeAmount(
                  memberIndex,
                  Number(e.target.value),
                  new Map(draweesSplitByAmount),
                  payeesBill,
                );
                if (error) {
                  recalculatePayeesBills(
                    payees,
                    draweeAmountState,
                    payeesBill,
                    setMultiplePayees,
                  );
                  setIsError();
                }
                setDraweesSplitByAmount(draweeAmountState);
              }
            }
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
          name="drawee-split-by-amount"
        />
      </div>
    </div>
  );
};

export default AmountSplit;
