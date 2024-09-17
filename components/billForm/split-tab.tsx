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
import useContributionsTabStore from "@/store/contributions-tab-store";
import useSplitTabStore from "@/store/split-tab-store";
import { IndianRupee, Percent, Scale, Users } from "lucide-react";
import AnimatedCounter from "../ui/animated-counter";
import AmountSplit from "./splitTab/amount-split";
import EqualSplit from "./splitTab/equal-split";
import PercentSplit from "./splitTab/percent-split";

const SplitTab = () => {
  const payeesBill = useContributionsTabStore.use.payeesBill();
  const currentSelectedTab = useSplitTabStore.use.currentSelectedTab();
  const setCurrentSelectedTab = useSplitTabStore.use.setCurrentSelectedTab();

  return (
    <>
      <DialogHeader className="hidden pb-4 md:block">
        <DialogTitle>Split By</DialogTitle>
        <DialogDescription className="flex gap-1">
          Total:{" "}
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
        <DrawerTitle>Split By</DrawerTitle>
        <DrawerDescription className="flex justify-center gap-1">
          Total:{" "}
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
      <Tabs
        value={currentSelectedTab}
        onValueChange={(tabName) => setCurrentSelectedTab(tabName)}
        className="w-full"
      >
        <div className="flex w-full justify-center pb-2">
          <TabsList className="w-min">
            <TabsTrigger value="equally">
              <Users className="mr-2 size-4" />
              Equally
            </TabsTrigger>
            <TabsTrigger value="amount">
              <IndianRupee className="mr-2 size-4" />
              Amount
            </TabsTrigger>
            <TabsTrigger value="percent">
              <Percent className="mr-2 size-4" />
              Percent
            </TabsTrigger>
            {/* <TabsTrigger value="weights">
              <Scale className="mr-2 hidden size-4 md:block" />
              Weights
            </TabsTrigger> */}
          </TabsList>
        </div>
        <ScrollArea className="split-tab">
          <div className="px-4 py-2 md:px-0 md:pr-4">
            <TabsContent value="equally">
              <EqualSplit />
            </TabsContent>
            <TabsContent value="amount">
              <AmountSplit />
            </TabsContent>
            <TabsContent value="percent">
              <PercentSplit />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </>
  );
};

export default SplitTab;
