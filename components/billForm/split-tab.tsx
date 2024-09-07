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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDraweeAmount, totalPayeeBill } from "@/lib/utils";
import useContributionsTabStore from "@/store/contributions-tab-store";
import useSplitTabStore from "@/store/split-tab-store";
import { IndianRupee, Percent, Scale, Users } from "lucide-react";
import { useMemo } from "react";
import AmountSplit from "./splitTab/amount-split";
import EqualSplit from "./splitTab/equal-split";

const SplitTab = () => {
  const payees = useContributionsTabStore((state) => state.payees);
  const payeeBill = useMemo(() => totalPayeeBill(payees), [payees]);
  const { drawees, draweeAmount, setDraweeAmount } = useSplitTabStore(
    (state) => state,
  );
  if (Object.keys(draweeAmount).length === 0) {
    setDraweeAmount(formatDraweeAmount(drawees, payeeBill));
  }
  return (
    <>
      <DialogHeader className="hidden pb-4 md:block">
        <DialogTitle>Split By</DialogTitle>
        <DialogDescription>
          Select those who spent with this expense
        </DialogDescription>
      </DialogHeader>
      <DrawerHeader className="pb-4 md:hidden">
        <DrawerTitle>Split</DrawerTitle>
        <DrawerDescription>
          Select those who spent with this expense
        </DrawerDescription>
      </DrawerHeader>
      <Tabs defaultValue="equally" className="w-full">
        <div className="flex w-full justify-center pb-2">
          <TabsList className="w-min">
            <TabsTrigger value="equally">
              <Users className="mr-2 hidden size-4 md:block" />
              Equally
            </TabsTrigger>
            <TabsTrigger value="amount">
              <IndianRupee className="mr-2 hidden size-4 md:block" />
              Amount
            </TabsTrigger>
            <TabsTrigger value="percent">
              <Percent className="mr-2 hidden size-4 md:block" />
              Percent
            </TabsTrigger>
            <TabsTrigger value="weights">
              <Scale className="mr-2 hidden size-4 md:block" />
              Weights
            </TabsTrigger>
          </TabsList>
        </div>
        <ScrollArea className="h-[256px]">
          <div className="px-4 py-2 md:px-0 md:pr-4">
            <TabsContent value="equally">
              <EqualSplit payeeBill={payeeBill} />
            </TabsContent>
            <TabsContent value="amount">
              <AmountSplit payeeBill={payeeBill} />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </>
  );
};

export default SplitTab;
