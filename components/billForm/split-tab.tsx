import AnimatedNumber from "@/components/ui/animated-number";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, totalPayeeBill } from "@/lib/utils";
import useDashboardStore from "@/store/dashboard-store";
import useFeetabStore from "@/store/fee-tab-store";
import useSplitTabStore from "@/store/split-tab-store";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useMemo } from "react";
import AnimatedCounter from "../ui/animated-counter";

const SplitTab = () => {
  const members = useDashboardStore((group) => group.members);
  const drawees = useSplitTabStore((state) => state.drawees);
  const payees = useFeetabStore((state) => state.payees);
  const payeeBill = useMemo(() => totalPayeeBill(payees), [payees]);
  return (
    <>
      <DialogHeader className="pb-4">
        <DialogTitle>Split</DialogTitle>
        <DialogDescription>
          Select those who spent with this expense
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="h-[300px]">
        <div className="flex flex-wrap items-center justify-center gap-5 pb-8 pt-4">
          {members.map((member, index) => (
            <ChooseDrawee
              key={`drawee-list-${index}`}
              memberName={member.name}
              memberId={member.memberId}
            />
          ))}
        </div>
        <div className="flex flex-col items-center justify-center gap-1">
          <motion.p layout="size" className="text-sm">
            Splitting with{" "}
            <AnimatedNumber
              value={drawees.length}
              className="font-mono font-bold text-primary"
            />{" "}
            people, each of them spent
          </motion.p>

          <span className="flex font-bold text-primary">
            <span className="mr-[0.1rem]">₹</span>
            <AnimatedCounter
              value={payeeBill / drawees.length}
              precision={2}
              className="font-mono"
            />
          </span>
        </div>
      </ScrollArea>
    </>
  );
};

const ChooseDrawee = ({
  memberName,
  memberId,
}: {
  memberName: string;
  memberId: string;
}) => {
  const [drawees, addDrawees, removeDrawees] = useSplitTabStore((state) => [
    state.drawees,
    state.addDrawees,
    state.removeDrawees,
  ]);

  const isSelected: boolean = drawees.some(
    ({ draweeId }) => draweeId === memberId,
  );

  const setDrawees = () => {
    if (isSelected) {
      if (drawees.length === 1) return;
      removeDrawees(memberId);
    } else addDrawees(memberId, memberName);
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
          "text-sm transition-colors duration-200 ease-in-out",
          isSelected ? "" : "text-muted-foreground/50",
        )}
      >
        {memberName}
      </p>
    </div>
  );
};

export default SplitTab;
