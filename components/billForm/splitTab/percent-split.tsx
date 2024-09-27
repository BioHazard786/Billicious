import AnimatedCounter from "@/components/ui/animated-counter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import {
  modifyDraweePercent,
  removeDraweeAmount,
  removeDraweePercent,
} from "@/lib/split-tab-utils";
import useContributionsTabStore from "@/store/contributions-tab-store";
import useDashboardStore from "@/store/dashboard-store";
import useSplitByAmountTabStore from "@/store/split-by-amount-tab-store";
import useSplitByPercentTabStore from "@/store/split-by-percent-tab-store";
import useSplitEquallyTabStore from "@/store/split-equally-tab-store";
import { toast } from "sonner";

const PercentSplit = () => {
  const members = useDashboardStore((group) => group.members);
  return (
    <div className="grid gap-4">
      {members.map((member, index) => (
        <DraweePercent
          key={`drawee-percent-${index}`}
          memberName={member.name}
          memberIndex={member.memberIndex}
        />
      ))}
    </div>
  );
};

const DraweePercent = ({
  memberName,
  memberIndex,
}: {
  memberName: string;
  memberIndex: string;
}) => {
  const payeesBill = useContributionsTabStore.getState().payeesBill;
  const drawees = useSplitEquallyTabStore.getState().drawees;
  const removeDrawees = useSplitEquallyTabStore.getState().removeDrawees;
  const draweesSplitByAmount =
    useSplitByAmountTabStore.getState().draweesSplitByAmount;
  const setDraweesSplitByAmount =
    useSplitByAmountTabStore.getState().setDraweesSplitByAmount;
  const draweesSplitByPercent =
    useSplitByPercentTabStore.use.draweesSplitByPercent();
  const setDraweesSplitByPercent =
    useSplitByPercentTabStore.getState().setDraweesSplitByPercent;

  return (
    <div className="flex items-center justify-evenly gap-3">
      <div className="flex flex-none items-center gap-2">
        <Avatar>
          <AvatarFallback>{memberName[0]}</AvatarFallback>
        </Avatar>
        <p className="w-14 truncate text-sm">{memberName}</p>
      </div>
      <Slider
        className=""
        value={[draweesSplitByPercent.get(memberIndex)?.percent ?? 0]}
        onValueChange={(value) => {
          if (value[0] === 0) {
            if (draweesSplitByPercent.size <= 1) {
              return toast.error("Drawee percent should not be zero");
            }
            if (drawees.includes(memberIndex)) {
              removeDrawees(memberIndex);
            }

            if (draweesSplitByPercent.has(memberIndex)) {
              setDraweesSplitByPercent(
                removeDraweePercent(
                  memberIndex,
                  new Map(draweesSplitByPercent),
                ),
              );
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
          } else {
            setDraweesSplitByPercent(
              modifyDraweePercent(
                memberIndex,
                value[0],
                new Map(draweesSplitByPercent),
              ),
            );
          }
        }}
        max={100}
        step={1}
      />
      <div className="flex flex-none flex-col items-center">
        <span className="text-sm font-medium">
          <span>{draweesSplitByPercent.get(memberIndex)?.percent ?? 0}</span>
          <span className="ml-[0.1rem]">%</span>
        </span>
        <span className="flex text-sm text-muted-foreground/50">
          <span className="mr-[0.1rem]">₹</span>
          <AnimatedCounter
            value={
              ((draweesSplitByPercent.get(memberIndex)?.percent ?? 0) *
                payeesBill) /
              100
            }
            precision={2}
            className="font-mono"
          />
        </span>
      </div>
    </div>
  );
};
export default PercentSplit;