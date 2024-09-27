"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { useMediaQuery } from "@/hooks/use-media-query";
import { formatDrawees } from "@/lib/split-tab-utils";
import {
  cn,
  formatMemberData,
  resetBillFormStores,
  titleCase,
} from "@/lib/utils";
import { addBillToGroupInDB } from "@/server/fetchHelpers";
import useAddBillStore from "@/store/add-bill-store";
import useContributionsTabStore from "@/store/contributions-tab-store";
import useDashboardStore from "@/store/dashboard-store";
import useDetailsTabStore from "@/store/details-tab-store";
import useSplitByAmountTabStore from "@/store/split-by-amount-tab-store";
import useSplitByPercentTabStore from "@/store/split-by-percent-tab-store";
import useSplitEquallyTabStore from "@/store/split-equally-tab-store";
import useSplitTabStore from "@/store/split-tab-store";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import AnimatedButton from "../ui/animated-button";
import ContributionsTab from "./contributions-tab";
import DetailsTab from "./details-tab";
import SplitTab from "./split-tab";

const tabs = [
  {
    id: 0,
    label: "Contributions",
    content: <ContributionsTab />,
  },
  {
    id: 1,
    label: "Split",
    content: <SplitTab />,
  },
  {
    id: 2,
    label: "Details",
    content: <DetailsTab />,
  },
];

const variants = {
  initial: (direction: number) => ({
    x: 300 * direction,
    opacity: 0,
    // filter: "blur(4px)",
  }),
  active: {
    x: 0,
    opacity: 1,
    // filter: "blur(0px)",
  },
  exit: (direction: number) => ({
    x: -300 * direction,
    opacity: 0,
    // filter: "blur(4px)",
  }),
};

function AddBillForm() {
  const { slug } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const activeTab = useAddBillStore.use.activeTab();
  const direction = useAddBillStore.use.direction();
  const isAnimating = useAddBillStore.use.isAnimating();
  const setActiveTab = useAddBillStore.use.setActiveTab();
  const setDirection = useAddBillStore.use.setDirection();
  const setIsAnimating = useAddBillStore.use.setIsAnimating();

  const addBillToGroup = useDashboardStore((state) => state.addBill);
  const addTransaction = useDashboardStore((state) => state.addTransaction);

  const payees = useContributionsTabStore.use.payees();
  const payeesBill = useContributionsTabStore.use.payeesBill();

  const billName = useDetailsTabStore.use.billName();
  const setBillName = useDetailsTabStore.use.setBillName();
  const notes = useDetailsTabStore.use.notes();
  const category = useDetailsTabStore.use.category();
  const [createdAt, setDate] = useDetailsTabStore((state) => [
    state.createdAt,
    state.setCreatedAt,
  ]);

  const currentSelectedTab = useSplitTabStore.use.currentSelectedTab();

  const draweesSplitEqually = useSplitEquallyTabStore.use.drawees();
  const draweesSplitByAmount =
    useSplitByAmountTabStore.use.draweesSplitByAmount();
  const draweesSplitByPercent =
    useSplitByPercentTabStore.use.draweesSplitByPercent();

  const content = useMemo(() => {
    const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;
    return activeTabContent || null;
  }, [activeTab, tabs]);

  const handleTabClick = (newTabId: number) => {
    if (Object.keys(payees).length === 0) {
      return toast.error("Enter payee amount first");
    }

    if (newTabId !== activeTab && !isAnimating) {
      const newDirection = newTabId > activeTab ? 1 : -1;
      setDirection(newDirection);
      setActiveTab(newTabId);
    }
  };

  const { isPending, mutate: server_createTransaction } = useMutation({
    mutationFn: addBillToGroupInDB,
    onSuccess: (data) => {
      setIsOpen(false);
      addBillToGroup({
        updatedMembers: formatMemberData(data.members),
        totalAmount: parseFloat(data.total_group_expense),
      });
      addTransaction({
        name: billName,
        category: category,
        createdAt: createdAt as Date,
        notes: notes,
        id: data.bill_id,
        amount: payeesBill,
        isPayment: false,
        drawees: data.drawees.map(
          (drawee: { userIndex: number }) => drawee.userIndex,
        ),
        payees: data.payees.map(
          (payee: { userIndex: number }) => payee.userIndex,
        ),
      });
      resetBillFormStores();
      return toast.success("Transaction added successfully");
    },
    onError: (error) => {
      console.log(error);
      setIsOpen(false);
      return toast.error("Error occured on Database.");
    },
  });

  const createTransaction = () => {
    if (!billName) {
      return toast.error("Bill Name should not be empty");
    }
    if (billName.length >= 32) {
      toast.error("Bill Name should be atmost 32 characters");
      return setBillName("");
    }

    server_createTransaction({
      group_id: slug as string,
      name: titleCase(billName),
      category: category,
      created_at: createdAt.getTime(),
      notes: notes,
      payees: payees,
      drawees: formatDrawees(
        draweesSplitEqually,
        draweesSplitByAmount,
        draweesSplitByPercent,
        payeesBill,
        currentSelectedTab,
      ),
    });
  };

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="rounded-lg"
            aria-label="Add-Transactions"
          >
            <Plus className="size-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="z-[101] placeholder:sm:max-w-[425px]">
          <div className="relative mx-auto h-full w-full overflow-hidden">
            <AnimatePresence
              custom={direction}
              mode="popLayout"
              onExitComplete={() => setIsAnimating(false)}
            >
              <motion.div
                key={activeTab}
                variants={variants}
                initial="initial"
                animate="active"
                exit="exit"
                transition={{ duration: 0.2, ease: "easeOut" }}
                custom={direction}
                onAnimationStart={() => setIsAnimating(true)}
                onAnimationComplete={() => setIsAnimating(false)}
              >
                {content}
              </motion.div>
            </AnimatePresence>
          </div>
          <DialogFooter className="flex-row items-center sm:justify-between">
            <CustomBreadcrumb handleTabClick={handleTabClick} />
            <AnimatedButton
              type="submit"
              variant="default"
              onClick={() => {
                if (activeTab + 1 < tabs.length) {
                  handleTabClick(activeTab + 1);
                } else {
                  createTransaction();
                }
              }}
              isDisabled={isPending || Object.keys(payees).length === 0}
              isLoading={isPending}
            >
              {activeTab + 1 === tabs.length ? "Create" : "Next"}
            </AnimatedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="rounded-lg"
          aria-label="Add-Transactions"
        >
          <Plus className="size-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="z-[101] placeholder:sm:max-w-[425px]">
        <DrawerHeader className="justify-center pb-0">
          <DrawerTitle>
            <CustomBreadcrumb handleTabClick={handleTabClick} />
          </DrawerTitle>
        </DrawerHeader>
        <div className="relative mx-auto h-full w-full overflow-hidden">
          <AnimatePresence
            initial={false}
            custom={direction}
            mode="popLayout"
            onExitComplete={() => setIsAnimating(false)}
          >
            <motion.div
              key={activeTab}
              variants={variants}
              initial="initial"
              animate="active"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
              custom={direction}
              onAnimationStart={() => setIsAnimating(true)}
              onAnimationComplete={() => setIsAnimating(false)}
            >
              {content}
            </motion.div>
          </AnimatePresence>
        </div>
        <DrawerFooter className="flex-row items-center justify-stretch">
          <AnimatedButton
            type="submit"
            variant="default"
            className="w-full"
            onClick={() => {
              if (activeTab + 1 < tabs.length) {
                handleTabClick(activeTab + 1);
              } else {
                createTransaction();
              }
            }}
            isDisabled={isPending || Object.keys(payees).length === 0}
            isLoading={isPending}
          >
            {activeTab + 1 === tabs.length ? "Create" : "Next"}
          </AnimatedButton>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export const CustomBreadcrumb = ({
  handleTabClick,
}: {
  handleTabClick: (newTabId: number) => void;
}) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {tabs.map((tab) => (
          <CustomBreadcrumbItem
            key={`tab-${tab.id}`}
            handleTabClick={handleTabClick}
            tabIndex={tab.id}
            tabName={tab.label}
          />
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

const CustomBreadcrumbItem = ({
  tabIndex,
  tabName,
  handleTabClick,
}: {
  tabIndex: number;
  tabName: string;
  handleTabClick: (newTabId: number) => void;
}) => {
  const { activeTab } = useAddBillStore((state) => state);

  return (
    <>
      <BreadcrumbItem>
        <BreadcrumbLink asChild>
          <div
            className={cn(
              "cursor-pointer",
              activeTab == tabIndex ? "text-foreground" : "",
            )}
            onClick={() => handleTabClick(tabIndex)}
          >
            {tabName}
          </div>
        </BreadcrumbLink>
      </BreadcrumbItem>
      {tabIndex + 1 < tabs.length ? <BreadcrumbSeparator /> : null}
    </>
  );
};

export default AddBillForm;
