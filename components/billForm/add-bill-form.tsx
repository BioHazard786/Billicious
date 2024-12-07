"use client";

import { CustomBreadcrumb } from "@/components/ui/breadcrumb";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { formatDrawees } from "@/components/billForm/splitTab/utils";
import { CURRENCIES } from "@/constants/items";
import { useMediaQuery } from "@/hooks/use-media-query";
import { resetBillFormStores, titleCase } from "@/lib/utils";
import { addBillToGroupInDB } from "@/server/fetchHelpers";
import useAddBillStore from "@/store/add-bill-store";
import useAddPaymentStore from "@/store/add-payment-store";
import useChocieTabStore from "@/store/choice-tab-store";
import useContributionsTabStore from "@/store/contributions-tab-store";
import useDashboardStore from "@/store/dashboard-store";
import useDetailsTabStore from "@/store/details-tab-store";
import usePaymentDetailsTabStore from "@/store/payment-details-tab-store";
import useSplitByAmountTabStore from "@/store/split-by-amount-tab-store";
import useSplitByPercentTabStore from "@/store/split-by-percent-tab-store";
import useSplitEquallyTabStore from "@/store/split-equally-tab-store";
import useSplitTabStore from "@/store/split-tab-store";
import useUserInfoStore from "@/store/user-info-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Banknote, Plus, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import AnimatedButton from "../ui/animated-button";
import ContributionsTab from "./contributions-tab";
import DetailsTab from "./details-tab";
import ChoiceTab from "./paymentTab/choice-tab";
import PaymentDetailsTab from "./paymentTab/payment-details-tab";
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

const tabs2 = [
  {
    id: 0,
    label: "Payment",
    content: <ChoiceTab />,
  },
  {
    id: 1,
    label: "Split",
    content: <PaymentDetailsTab />,
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
  const [choiceSelected, setChoiceSelected] = useState<
    "bill" | "payment" | null
  >(null);

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const queryClient = useQueryClient();

  const activeTab = useAddBillStore.use.activeTab();
  const direction = useAddBillStore.use.direction();
  const isAnimating = useAddBillStore.use.isAnimating();
  const setActiveTab = useAddBillStore.use.setActiveTab();
  const setDirection = useAddBillStore.use.setDirection();
  const setIsAnimating = useAddBillStore.use.setIsAnimating();

  const activeTab2 = useAddPaymentStore.use.activeTab();
  const direction2 = useAddPaymentStore.use.direction();
  const isAnimating2 = useAddPaymentStore.use.isAnimating();
  const setActiveTab2 = useAddPaymentStore.use.setActiveTab();
  const setDirection2 = useAddPaymentStore.use.setDirection();
  const setIsAnimating2 = useAddPaymentStore.use.setIsAnimating();

  const amountToBePaid = useChocieTabStore.use.amountToBePaid();
  const selectedPayee = useChocieTabStore.use.selectedPayee();
  const selectedDrawee = useChocieTabStore.use.selectedDrawee();
  const description = usePaymentDetailsTabStore.use.description();
  const paymentNotes = usePaymentDetailsTabStore.use.notes();
  const [paymentCreatedAt, setPaymentDate] = usePaymentDetailsTabStore(
    (state) => [state.createdAt, state.setCreatedAt],
  );

  const currencyCode = useDashboardStore((state) => state.currencyCode);
  const currencySymbol = useMemo(
    () => CURRENCIES[currencyCode || "INR"].currencySymbol,
    [currencyCode],
  );

  const user = useUserInfoStore((state) => state.user);
  const members = useDashboardStore((state) => state.members);

  const addBillToGroup = useDashboardStore((state) => state.updateGroup);
  const addTransaction = useDashboardStore((state) => state.addTransaction);

  const payees = useContributionsTabStore.use.payees();
  const payeesBill = useContributionsTabStore.use.payeesBill();

  const billName = useDetailsTabStore.use.billName();
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

  const content2 = useMemo(() => {
    const activeTabContent2 = tabs2.find(
      (tab) => tab.id === activeTab2,
    )?.content;
    return activeTabContent2 || null;
  }, [activeTab2, tabs2]);

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

  const handleTabClick2 = (newTabId: number) => {
    if (!selectedPayee) return toast.error("Select payee first");
    if (!selectedDrawee) return toast.error("Select drawee first");
    if (!amountToBePaid) return toast.error("Enter amount to be paid first");

    if (newTabId !== activeTab2 && !isAnimating2) {
      const newDirection = newTabId > activeTab2 ? 1 : -1;
      setDirection2(newDirection);
      setActiveTab2(newTabId);
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
      // queryClient.invalidateQueries({
      //   queryKey: ["settleUp", groupId as string],
      //   exact: true,
      // });
      // queryClient.invalidateQueries({
      //   queryKey: ["expenses", groupId as string],
      //   exact: true,
      // });
      // queryClient.invalidateQueries({
      //   queryKey: ["timelineChart", groupId as string],
      //   exact: true,
      // });
      // queryClient.invalidateQueries({
      //   queryKey: ["categoryChart", groupId as string],
      //   exact: true,
      // });
      resetBillFormStores();
      setChoiceSelected(null);
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

  const { isPending: isPaymentPending, mutate: server_createPayment } =
    useMutation({
      mutationFn: addBillToGroupInDB,
      onMutate: (variables) => {
        const toastId = toast.loading(
          `Processing a payment of ${currencySymbol}${amountToBePaid.toFixed(2)} from ${members[Number(selectedPayee)].name} to ${members[Number(selectedDrawee)].name}...`,
        );
        return { toastId };
      },
      onSuccess: async (data, variables, context) => {
        console.log(data);
        // addBillToGroup({
        //   updatedMemberData: data.members,
        // });
        // addTransaction({
        //   name: variables.name,
        //   category: variables.category,
        //   createdAt: createdAt,
        //   notes: variables.notes,
        //   id: data.bill_id,
        //   amount: amountToBePaid,
        //   isPayment: true,
        //   drawees: data.drawees.map(
        //     (drawee: { userIndex: number }) => drawee.userIndex,
        //   ),
        //   payees: data.payees.map(
        //     (payee: { userIndex: number }) => payee.userIndex,
        //   ),
        // });
        // queryClient.invalidateQueries({
        //   queryKey: ["settleUp", groupId as string],
        //   exact: true,
        // });
        // queryClient.invalidateQueries({
        //   queryKey: ["expenses", groupId as string],
        //   exact: true,
        // });
        resetBillFormStores();
        setChoiceSelected(null);
        return toast.success(
          `Successfully processed a payment of ${currencySymbol}${amountToBePaid.toFixed(2)} from ${members[Number(selectedPayee)].name} to ${members[Number(selectedDrawee)].name}`,
          {
            id: context.toastId,
          },
        );
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

  const createTransaction = () => {
    if (!billName) {
      return toast.error("Bill Name should not be empty");
    }

    const billCreatedBy =
      members.find((member) => member.memberId === user?.id)?.memberIndex || 0;

    server_createTransaction({
      groupId: groupId as string,
      name: titleCase(billName),
      category: category,
      createdAt: createdAt.getTime(),
      createdBy: Number(billCreatedBy),
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

  const createPayment = () => {
    if (!description) {
      return toast.error("Description should not be empty");
    }

    const billCreatedBy =
      members.find((member) => member.memberId === user?.id)?.memberIndex || 0;

    server_createPayment({
      groupId: groupId as string,
      name: titleCase(description),
      category: "Payment",
      createdAt: paymentCreatedAt.getTime(),
      createdBy: Number(billCreatedBy),
      isPayment: true,
      notes: paymentNotes,
      payees: { [selectedPayee as string]: amountToBePaid },
      drawees: { [selectedDrawee as string]: amountToBePaid },
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
          {choiceSelected === "bill" ? (
            <>
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
            </>
          ) : choiceSelected === "payment" ? (
            <>
              <div className="relative mx-auto h-full w-full overflow-hidden">
                <AnimatePresence
                  initial={false}
                  custom={direction2}
                  mode="popLayout"
                  onExitComplete={() => setIsAnimating2(false)}
                >
                  <motion.div
                    key={activeTab2}
                    variants={variants}
                    initial="initial"
                    animate="active"
                    exit="exit"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    custom={direction2}
                    onAnimationStart={() => setIsAnimating2(true)}
                    onAnimationComplete={() => setIsAnimating2(false)}
                  >
                    {content2}
                  </motion.div>
                </AnimatePresence>
              </div>
              <DialogFooter className="flex-row items-center sm:justify-between">
                <CustomBreadcrumb
                  handleTabClick={handleTabClick2}
                  tabs={tabs2}
                  activeTab={activeTab2}
                />
                <AnimatedButton
                  type="submit"
                  variant="default"
                  onClick={() => {
                    if (activeTab2 + 1 < tabs2.length) {
                      handleTabClick2(activeTab2 + 1);
                    } else {
                      createPayment();
                    }
                  }}
                  isDisabled={
                    isPaymentPending ||
                    !selectedPayee ||
                    !selectedDrawee ||
                    !amountToBePaid
                  }
                  isLoading={isPaymentPending}
                >
                  {activeTab2 + 1 === tabs2.length ? "Create" : "Next"}
                </AnimatedButton>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Choose an Action</DialogTitle>
                <DialogDescription>
                  Would you like to manage group expenses or make a payment?
                  Select an option to proceed.
                </DialogDescription>
                <div className="flex items-center justify-center gap-4 md:h-[366px]">
                  <div className="space-y-2 text-center">
                    <Button
                      className="size-[13rem] bg-[--accent-bg]"
                      data-accent-color="red"
                      variant="secondary"
                      size="icon"
                      onClick={() => setChoiceSelected("bill")}
                    >
                      <Users
                        className="size-[7rem] text-[--accent-fg]"
                        data-accent-color="red"
                      />
                    </Button>
                    <p className="text-lg font-semibold text-muted-foreground">
                      Group Expense
                    </p>
                  </div>
                  <div className="space-y-2 text-center">
                    <Button
                      className="size-[13rem] bg-[--accent-bg]"
                      data-accent-color="jade"
                      variant="secondary"
                      size="icon"
                      onClick={() => setChoiceSelected("payment")}
                    >
                      <Banknote
                        className="size-[7rem] text-[--accent-fg]"
                        data-accent-color="jade"
                      />
                    </Button>
                    <p className="text-lg font-semibold text-muted-foreground">
                      Payment
                    </p>
                  </div>
                </div>
              </DialogHeader>
            </>
          )}
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
        {choiceSelected === "bill" ? (
          <DrawerHeader className="justify-center pb-0">
            <CustomBreadcrumb
              handleTabClick={handleTabClick}
              tabs={tabs}
              activeTab={activeTab}
            />
          </DrawerHeader>
        ) : choiceSelected === "payment" ? (
          <DrawerHeader className="justify-center pb-0">
            <CustomBreadcrumb
              handleTabClick={handleTabClick2}
              tabs={tabs2}
              activeTab={activeTab2}
            />
          </DrawerHeader>
        ) : null}
        {choiceSelected === "bill" ? (
          <>
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
                  if (activeTab2 + 1 < tabs2.length) {
                    handleTabClick(activeTab2 + 1);
                  } else {
                    createTransaction();
                  }
                }}
                isDisabled={isPending || Object.keys(payees).length === 0}
                isLoading={isPending}
              >
                {activeTab2 + 1 === tabs2.length ? "Create" : "Next"}
              </AnimatedButton>
            </DrawerFooter>
          </>
        ) : choiceSelected === "payment" ? (
          <>
            <div className="relative mx-auto h-full w-full overflow-hidden">
              <AnimatePresence
                initial={false}
                custom={direction2}
                mode="popLayout"
                onExitComplete={() => setIsAnimating2(false)}
              >
                <motion.div
                  key={activeTab2}
                  variants={variants}
                  initial="initial"
                  animate="active"
                  exit="exit"
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  custom={direction2}
                  onAnimationStart={() => setIsAnimating2(true)}
                  onAnimationComplete={() => setIsAnimating2(false)}
                >
                  {content2}
                </motion.div>
              </AnimatePresence>
            </div>
            <DrawerFooter className="flex-row items-center justify-stretch">
              <AnimatedButton
                type="submit"
                variant="default"
                className="w-full"
                onClick={() => {
                  if (activeTab2 + 1 < tabs2.length) {
                    handleTabClick2(activeTab2 + 1);
                  } else {
                    createPayment();
                  }
                }}
                isDisabled={
                  isPaymentPending ||
                  !selectedPayee ||
                  !selectedDrawee ||
                  !amountToBePaid
                }
                isLoading={isPaymentPending}
              >
                {activeTab2 + 1 === tabs2.length ? "Create" : "Next"}
              </AnimatedButton>
            </DrawerFooter>
          </>
        ) : (
          <>
            <DrawerHeader>
              <DrawerTitle>Choose an Action</DrawerTitle>
              <DrawerDescription>
                Would you like to manage group expenses or make a payment?
                Select an option to proceed.
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex h-[50vh] items-center justify-center gap-4 px-4 text-center">
              <div>
                <Button
                  className="size-[10rem] bg-[--accent-bg]"
                  data-accent-color="red"
                  variant="secondary"
                  size="icon"
                  onClick={() => setChoiceSelected("bill")}
                >
                  <Users
                    className="size-[5rem] text-[--accent-fg]"
                    data-accent-color="red"
                  />
                </Button>
                <p className="text-smmd font-medium text-muted-foreground">
                  Group Expense
                </p>
              </div>
              <div>
                <Button
                  className="size-[10rem] bg-[--accent-bg]"
                  data-accent-color="jade"
                  variant="secondary"
                  size="icon"
                  onClick={() => setChoiceSelected("payment")}
                >
                  <Banknote
                    className="size-[7rem] text-[--accent-fg]"
                    data-accent-color="jade"
                  />
                </Button>
                <p className="text-smmd font-medium text-muted-foreground">
                  Payment
                </p>
              </div>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

export default AddBillForm;
