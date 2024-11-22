import {
  modifyDraweeAmount,
  recalculatePayeesBills,
  removeDraweeAmount,
  removeDraweePercent,
} from "@/components/billForm/splitTab/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input, InputWithCurrency } from "@/components/ui/input";
import { CURRENCIES } from "@/constants/items";
import { useAppleDevice } from "@/hooks/use-apple-device";
import useContributionsTabStore from "@/store/contributions-tab-store";
import useDashboardStore from "@/store/dashboard-store";
import useSplitByAmountTabStore from "@/store/split-by-amount-tab-store";
import useSplitByPercentTabStore from "@/store/split-by-percent-tab-store";
import useSplitEquallyTabStore from "@/store/split-equally-tab-store";
import { useMemo } from "react";
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
          avatarUrl={member.avatarUrl}
        />
      ))}
    </div>
  );
};

const DraweeInput = ({
  memberName,
  memberIndex,
  avatarUrl,
}: {
  memberName: string;
  memberIndex: string;
  avatarUrl?: string;
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
  const currencyCode = useDashboardStore((state) => state.currencyCode);
  const currencySymbol = useMemo(
    () => CURRENCIES[currencyCode || "INR"].currencySymbol,
    [currencyCode],
  );

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src={avatarUrl} alt={memberName} />
          <AvatarFallback>{memberName[0]}</AvatarFallback>
        </Avatar>
        <p className="w-14 truncate text-sm md:w-32">{memberName}</p>
      </div>
      <InputWithCurrency
        currencyCode={currencyCode}
        currencySymbol={currencySymbol}
        className={isApple ? "text-base" : ""}
        type="number"
        value={
          draweesSplitByAmount.get(memberIndex)
            ? Math.floor(draweesSplitByAmount.get(memberIndex)!.amount * 100) /
              100
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
  );
};

export default AmountSplit;
