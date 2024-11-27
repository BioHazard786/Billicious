"use client";

import { CustomBreadcrumb } from "@/components/ui/breadcrumb";

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
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { createClient } from "@/auth-utils/client";
import { formatDrawees } from "@/components/billForm/splitTab/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { resetBillFormStores, titleCase } from "@/lib/utils";
import { addBillToGroupInDB, viewGroup } from "@/server/fetchHelpers";
import useAddBillStore from "@/store/add-bill-store";
import useContributionsTabStore from "@/store/contributions-tab-store";
import useDashboardStore from "@/store/dashboard-store";
import useDetailsTabStore from "@/store/details-tab-store";
import useSplitByAmountTabStore from "@/store/split-by-amount-tab-store";
import useSplitByPercentTabStore from "@/store/split-by-percent-tab-store";
import useSplitEquallyTabStore from "@/store/split-equally-tab-store";
import useSplitTabStore from "@/store/split-tab-store";
import useUserInfoStore from "@/store/user-info-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  const { slug: groupId } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const user = useUserInfoStore((state) => state.user);

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
    onMutate: (variables) => {
      const toastId = toast.loading(
        `Creating ${variables.name} transaction...`,
      );
      return { toastId };
    },
    onSuccess: (data, variables, context) => {
      addBillToGroup({
        updatedMemberData: data.members,
        totalAmount: Number(data.totalGroupExpense),
      });
      addTransaction({
        name: variables.name,
        category: variables.category,
        createdAt: createdAt,
        notes: variables.notes,
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
      queryClient.invalidateQueries({
        queryKey: ["settleUp", user?.id, groupId as string],
      });
      queryClient.invalidateQueries({
        queryKey: ["expenses", user?.id, groupId as string],
      });
      resetBillFormStores();
      return toast.success(`${variables.name} transaction added successfully`, {
        id: context.toastId,
      });
    },
    onError: (error, variables, context) => {
      console.log(error);
      return toast.error(error.message, {
        id: context?.toastId,
      });
    },
    onSettled: () => {
      setIsOpen(false);
    },
  });

  const { mutateAsync: server_fetchNewGroupData } = useMutation({
    mutationFn: viewGroup,
    onSuccess: (data) => {
      addBillToGroup({
        updatedMemberData: data.members,
        totalAmount: Number(data.group.totalExpense),
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const createTransaction = () => {
    if (!billName) {
      return toast.error("Bill Name should not be empty");
    }
    if (billName.length > 32) {
      toast.error("Bill Name should be atmost 32 characters");
      return setBillName("");
    }

    server_createTransaction({
      groupId: groupId as string,
      name: titleCase(billName),
      category: category,
      createdAt: createdAt.getTime(),
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

  useEffect(() => {
    const channel = supabase
      .channel("realtime bills")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bills_table",
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          await server_fetchNewGroupData(groupId as string);
          addTransaction({
            name: payload.new.name,
            category: payload.new.category,
            createdAt: new Date(payload.new.created_at + "Z"),
            notes: payload.new.notes,
            id: payload.new.id,
            amount: payload.new.amount,
            isPayment: payload.new.is_payment,
            drawees: payload.new.drawees_string.split("|").map(Number),
            payees: payload.new.payees_string.split("|").map(Number),
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
          <DialogFooter className="flex-row items-center sm:justify-between">
            <CustomBreadcrumb
              handleTabClick={handleTabClick}
              tabs={tabs}
              activeTab={activeTab}
            />
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
      <DrawerContent className="z-[101]">
        <DrawerHeader className="justify-center pb-0">
          <CustomBreadcrumb
            handleTabClick={handleTabClick}
            tabs={tabs}
            activeTab={activeTab}
          />
          <DrawerDescription></DrawerDescription>
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

export default AddBillForm;
