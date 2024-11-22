import {
  addDraweeAmount,
  addDraweePercent,
  removeDraweeAmount,
  removeDraweePercent,
} from "@/components/billForm/splitTab/utils";
import AnimatedCounter from "@/components/ui/animated-counter";
import AnimatedNumber from "@/components/ui/animated-number";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CURRENCIES } from "@/constants/items";
import { cn } from "@/lib/utils";
import useContributionsTabStore from "@/store/contributions-tab-store";
import useDashboardStore from "@/store/dashboard-store";
import useSplitByAmountTabStore from "@/store/split-by-amount-tab-store";
import useSplitByPercentTabStore from "@/store/split-by-percent-tab-store";
import useSplitEquallyTabStore from "@/store/split-equally-tab-store";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useMemo } from "react";

const EqualSplit = () => {
  const members = useDashboardStore((group) => group.members);
  const payeesBill = useContributionsTabStore.getState().payeesBill;
  const drawees = useSplitEquallyTabStore.use.drawees();
  const currencyCode = useDashboardStore((state) => state.currencyCode);
  const currencySymbol = useMemo(
    () => CURRENCIES[currencyCode || "INR"].currencySymbol,
    [currencyCode],
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-3 pb-8">
        {members.map((member, index) => (
          <ChooseDrawee
            key={`drawee-list-${index}`}
            memberName={member.name}
            memberIndex={member.memberIndex}
            avatarUrl={member.avatarUrl}
          />
        ))}
      </div>
      <div className="flex flex-col items-center justify-center gap-1">
        <motion.span layout="size" className="text-sm">
          Splitting with{" "}
          <AnimatedNumber
            value={drawees.length}
            className="font-mono font-bold text-primary"
          />{" "}
          people, each of them spent
        </motion.span>

        <span className="flex font-bold text-primary">
          <span className="mr-[0.1rem]">{currencySymbol}</span>

          <AnimatedCounter
            value={drawees.length > 0 ? payeesBill / drawees.length : 0}
            precision={2}
            className="font-mono"
          />
        </span>
      </div>
    </>
  );
};

const ChooseDrawee = ({
  memberName,
  memberIndex,
  avatarUrl,
}: {
  memberName: string;
  memberIndex: string;
  avatarUrl?: string;
}) => {
  const payeesBill = useContributionsTabStore.getState().payeesBill;
  const draweesSplitByAmount =
    useSplitByAmountTabStore.getState().draweesSplitByAmount;
  const setDraweesSplitByAmount =
    useSplitByAmountTabStore.getState().setDraweesSplitByAmount;
  const draweesSplitByPercent =
    useSplitByPercentTabStore.getState().draweesSplitByPercent;
  const setDraweesSplitByPercent =
    useSplitByPercentTabStore.getState().setDraweesSplitByPercent;

  const drawees = useSplitEquallyTabStore.getState().drawees;
  const addDrawees = useSplitEquallyTabStore.use.addDrawees();
  const removeDrawees = useSplitEquallyTabStore.use.removeDrawees();

  const isSelected: boolean = drawees.includes(memberIndex);

  const setDrawees = () => {
    if (isSelected) {
      if (drawees.length === 1) return;
      removeDrawees(memberIndex);
      setDraweesSplitByAmount(
        removeDraweeAmount(memberIndex, draweesSplitByAmount, payeesBill),
      );
      setDraweesSplitByPercent(
        removeDraweePercent(memberIndex, draweesSplitByPercent),
      );
    } else {
      addDrawees(memberIndex);
      setDraweesSplitByAmount(
        addDraweeAmount(memberIndex, draweesSplitByAmount, payeesBill),
      );
      setDraweesSplitByPercent(
        addDraweePercent(memberIndex, draweesSplitByPercent),
      );
    }
  };

  return (
    <div
      className="flex cursor-pointer flex-col items-center gap-1"
      onClick={setDrawees}
    >
      <div className="relative">
        <Avatar>
          <AvatarImage src={avatarUrl} alt={memberName} />
          <AvatarFallback>{memberName[0]}</AvatarFallback>
        </Avatar>
        <AnimatePresence presenceAffectsLayout>
          {isSelected && (
            <motion.div
              animate={{ scale: 1 }}
              initial={{ scale: 0 }}
              exit={{ scale: 0 }}
              transition={{ ease: "easeInOut", duration: 0.2 }}
              className="absolute bottom-[-3%] right-[-13%] rounded-full bg-primary p-[0.1rem]"
            >
              <Check className="size-[0.85rem] text-primary-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p
        className={cn(
          "w-14 truncate text-center text-sm transition-colors duration-200 ease-in-out",
          isSelected ? "" : "text-muted-foreground/50",
        )}
      >
        {memberName}
      </p>
    </div>
  );
};

export default EqualSplit;
