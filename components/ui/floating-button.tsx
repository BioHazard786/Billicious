"use client";
import {
  Popover,
  PopoverTrigger,
  PopoverWithOverlayContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  motion,
  useAnimate,
  usePresence,
  type Variants,
} from "framer-motion";
import { ReactNode, useState } from "react";
import { Button } from "./button";

type FloatingButtonProps = {
  className?: string;
  children: ReactNode;
  triggerContent: ReactNode;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  align: "start" | "center" | "end";
  alignOffset: number;
  side: "top" | "right" | "bottom" | "left";
};

type FloatingButtonItemProps = {
  children: ReactNode;
  variants?: Variants;
};

const list = {
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      staggerDirection: -1,
    },
  },
  hidden: {
    opacity: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.1,
    },
  },
};

const item = {
  visible: { opacity: 1, y: 0 },
  hidden: { opacity: 0, y: 5 },
};

const btn = {
  visible: { rotate: "45deg" },
  hidden: { rotate: 0 },
};

const FloatingButton: React.FC<FloatingButtonProps> = ({
  className,
  children,
  triggerContent,
  isOpen,
  setIsOpen,
  ...popoverContentProps
}) => {
  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      modal
      data-state={isOpen ? "open" : "closed"}
    >
      <PopoverTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="rounded-lg"
          aria-label="Add-Transactions"
        >
          <motion.div variants={btn} animate={isOpen ? "visible" : "hidden"}>
            {triggerContent}
          </motion.div>
        </Button>
      </PopoverTrigger>

      <PopoverWithOverlayContent
        {...popoverContentProps}
        className="z-[101] w-min border-none bg-transparent shadow-none"
      >
        <motion.ul
          initial="hidden"
          animate={isOpen ? "visible" : "hidden"}
          variants={list}
          className={cn("flex flex-row items-center gap-4", className)}
        >
          {children}
        </motion.ul>
      </PopoverWithOverlayContent>
    </Popover>
  );
};

function FloatingButtonItem({ children, variants }: FloatingButtonItemProps) {
  return (
    <motion.li variants={variants || item} className="z-[101]">
      {children}
    </motion.li>
  );
}

export { FloatingButton, FloatingButtonItem };
