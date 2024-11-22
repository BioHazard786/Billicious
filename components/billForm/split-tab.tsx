import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CURRENCIES } from "@/constants/items";
import useContributionsTabStore from "@/store/contributions-tab-store";
import useDashboardStore from "@/store/dashboard-store";
import useSplitTabStore from "@/store/split-tab-store";
import { IndianRupee, Percent, Scale, Users } from "lucide-react";
import { useMemo } from "react";
import AnimatedCounter from "../ui/animated-counter";
import AmountSplit from "./splitTab/amount-split";
import EqualSplit from "./splitTab/equal-split";
import PercentSplit from "./splitTab/percent-split";

const SplitTab = () => {
  const payeesBill = useContributionsTabStore.use.payeesBill();
  const currentSelectedTab = useSplitTabStore.use.currentSelectedTab();
  const setCurrentSelectedTab = useSplitTabStore.use.setCurrentSelectedTab();
  const currencyCode = useDashboardStore((state) => state.currencyCode);
  const currencySymbol = useMemo(
    () => CURRENCIES[currencyCode || "INR"].currencySymbol,
    [currencyCode],
  );

  return (
    <>
      <DialogHeader className="hidden pb-4 md:block">
        <DialogTitle>Split By</DialogTitle>
        <div className="flex gap-1 text-sm text-muted-foreground">
          Total:{" "}
          <span className="flex">
            <span className="mr-[0.1rem]">{currencySymbol}</span>
            <AnimatedCounter
              value={payeesBill}
              precision={2}
              className="font-mono"
            />
          </span>
        </div>
      </DialogHeader>
      <DrawerHeader className="justify-center pb-4 md:hidden">
        <DrawerTitle className="text-center">Split By</DrawerTitle>
        <div className="flex justify-center gap-1 text-sm text-muted-foreground">
          Total:{" "}
          <span className="flex">
            <span className="mr-[0.1rem]">{currencySymbol}</span>
            <AnimatedCounter
              value={payeesBill}
              precision={2}
              className="font-mono"
            />
          </span>
        </div>
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
