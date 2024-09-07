import AnimatedCounter from "@/components/ui/animated-counter";
import AnimatedNumber from "@/components/ui/animated-number";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, removeDraweeAmount } from "@/lib/utils";
import useDashboardStore from "@/store/dashboard-store";
import useSplitTabStore from "@/store/split-tab-store";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

const EqualSplit = ({ payeeBill }: { payeeBill: number }) => {
  const members = useDashboardStore((group) => group.members);
  const { drawees } = useSplitTabStore((state) => state);
  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-3 pb-8">
        {members.map((member, index) => (
          <ChooseDrawee
            key={`drawee-list-${index}`}
            memberName={member.name}
            memberIndex={member.memberIndex}
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
          <span className="mr-[0.1rem]">₹</span>
          <AnimatedCounter
            value={payeeBill / drawees.length}
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
}: {
  memberName: string;
  memberIndex: string;
}) => {
  const { drawees, addDrawees, draweeAmount, removeDrawees, setDraweeAmount } =
    useSplitTabStore((state) => state);

  const isSelected: boolean = drawees.includes(memberIndex);

  const setDrawees = () => {
    if (isSelected) {
      if (drawees.length === 1) return;
      removeDrawees(memberIndex);
      setDraweeAmount(removeDraweeAmount(memberIndex, draweeAmount));
    } else addDrawees(memberIndex);
  };
  return (
    <div
      className="flex cursor-pointer flex-col items-center gap-1"
      onClick={setDrawees}
    >
      <div className="relative">
        <Avatar>
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
