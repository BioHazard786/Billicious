"use client";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { Activity, LayoutDashboard, PieChart, Plus, Users } from "lucide-react";

import {
  Variants,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { useRef, useState } from "react";
import { AddBillFormDrawer } from "../dashboard/add-bill-form";

const FloatingNavbar = () => {
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const lastYRef = useRef(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    const difference = y - lastYRef.current;
    if (Math.abs(difference) > 150) {
      setHidden(difference > 0);
      lastYRef.current = y;
    }
  });

  return (
    <motion.nav
      animate={hidden ? "hidden" : "visible"}
      initial="visible"
      onFocusCapture={hidden ? () => setHidden(false) : undefined}
      variants={
        {
          visible: { y: "0%" },
          hidden: { y: "140%" },
        } as Variants
      }
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="fixed inset-x-0 bottom-5 z-[75] mx-auto flex w-min items-center justify-center gap-4 rounded-lg border border-border bg-background p-2 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden"
    >
      <Button
        variant="ghost"
        size="icon"
        className="rounded-lg bg-muted"
        aria-label="Dashboard"
      >
        <LayoutDashboard className="size-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-lg"
        aria-label="Expenses"
      >
        <PieChart className="size-5" />
      </Button>
      <Drawer>
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
        <AddBillFormDrawer />
      </Drawer>

      <Button
        variant="ghost"
        size="icon"
        className="rounded-lg"
        aria-label="Activities"
      >
        <Activity className="size-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-lg"
        aria-label="Members"
      >
        <Users className="size-5" />
      </Button>
    </motion.nav>
  );
};

export default FloatingNavbar;
