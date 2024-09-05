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
import {
  cn,
  formatDrawees,
  formatMemberData,
  resetBillFormStores,
  totalPayeeBill,
} from "@/lib/utils";
import { addBillToGroupInDB } from "@/server/fetchHelpers";
import useAddBillStore from "@/store/add-bill-store";
import useContributionsTabStore from "@/store/contributions-tab-store";
import useDashboardStore from "@/store/dashboard-store";
import useDetailstabStore from "@/store/details-tab-store";
import useSplitTabStore from "@/store/split-tab-store";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import Spinner from "../ui/spinner";
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
    filter: "blur(4px)",
  }),
  active: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
  },
  exit: (direction: number) => ({
    x: -300 * direction,
    opacity: 0,
    filter: "blur(4px)",
  }),
};

function AddBillForm() {
  const { slug } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const {
    activeTab,
    direction,
    isAnimating,
    setActiveTab,
    setDirection,
    setIsAnimating,
  } = useAddBillStore((state) => state);

  const addBillToGroup = useDashboardStore((state) => state.addBill);
  const payees = useContributionsTabStore((state) => state.payees);
  const payeeBill = useMemo(() => totalPayeeBill(payees), [payees]);

  const { billName, setBillName, createdAt, notes } = useDetailstabStore(
    (state) => state,
  );
  const drawees = useSplitTabStore((state) => state.drawees);

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
      addBillToGroup({
        updatedMembers: formatMemberData(data.members),
        totalAmount: parseFloat(data.total_group_expense),
      });
      return toast.success("Bill added successfully");
    },
    onError: (error) => {
      console.log(error);
      return toast.error("Error occured on Database.");
    },
    onSettled: () => {
      setIsOpen(false);
      resetBillFormStores();
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
      name: billName,
      category: "Food",
      created_at: createdAt,
      notes: notes,
      payees: payees,
      drawees: formatDrawees(drawees, payeeBill),
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
            <Button
              className="w-[75px]"
              variant="default"
              disabled={Object.keys(payees).length === 0 ? true : false}
              onClick={() => {
                if (activeTab + 1 < tabs.length) {
                  handleTabClick(activeTab + 1);
                } else {
                  createTransaction();
                }
              }}
            >
              <AnimatePresence initial={false} mode="wait">
                {isPending ? (
                  <Spinner
                    key="spinner"
                    AnimationProps={{
                      initial: { y: "100%", opacity: 0 },
                      animate: { y: 0, opacity: 1 },
                      exit: { y: "-100%", opacity: 0 },
                      transition: { ease: "easeInOut", duration: 0.2 },
                    }}
                  />
                ) : (
                  <motion.span
                    key="button-text"
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ ease: "easeInOut", duration: 0.2 }}
                  >
                    {activeTab + 1 === tabs.length ? "Create" : "Next"}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
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
          <AnimatePresence presenceAffectsLayout initial={false}>
            <Button
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
              disabled={Object.keys(payees).length === 0 ? true : false}
            >
              {isPending && <Spinner className="mr-[0.35rem]" />}
              <motion.span
                layout
                transition={{ ease: "easeInOut", duration: 0.2 }}
              >
                {activeTab + 1 === tabs.length ? "Create" : "Next"}
              </motion.span>
            </Button>
          </AnimatePresence>
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
