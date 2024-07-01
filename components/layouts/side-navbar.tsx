import { Activity, LayoutDashboard, PieChart, Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import AddBillForm from "../billForm/add-bill-form";

const SideNavbar = () => {
  return (
    <aside className="fixed inset-y-0 left-0 z-[76] hidden h-full flex-col border-r border-border lg:flex">
      <div className="p-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Home"
          className="flex items-center justify-center"
        >
          <Image src={"/mascot.svg"} alt={"mascot"} width={25} height={25} />
        </Button>
      </div>
      <nav className="grid gap-3 p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg bg-muted"
              aria-label="Dashboard"
            >
              <LayoutDashboard className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={5}>
            Dashboard
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg"
              aria-label="Expenses"
            >
              <PieChart className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={5}>
            Expenses
          </TooltipContent>
        </Tooltip>
        <Dialog>
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
          <AddBillForm />
        </Dialog>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg"
              aria-label="Activities"
            >
              <Activity className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={5}>
            Activities
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg"
              aria-label="Members"
            >
              <Users className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={5}>
            Members
          </TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
};

export default SideNavbar;
