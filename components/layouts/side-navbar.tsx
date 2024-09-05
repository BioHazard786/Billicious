"use client";

import { Activity, LayoutDashboard, PieChart, Plus, Users } from "lucide-react";

import AddBillForm from "@/components/billForm/add-bill-form";
import { Button } from "@/components/ui/button";
import Mascot from "@/components/ui/mascot";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const SideNavbar = () => {
  const pathname = usePathname();
  const { slug } = useParams();

  return (
    <aside className="fixed inset-y-0 left-0 z-[76] hidden h-full flex-col border-r border-border lg:flex">
      <div className="p-2 pt-[0.6rem]">
        <Mascot className="cursor-pointer" />
      </div>
      <nav className="grid gap-3 p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/group/${encodeURIComponent(slug as string)}`}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-lg",
                  /^\/group\/[^\/]+$/.test(pathname) ? "bg-muted" : "",
                )}
                aria-label="Dashboard"
              >
                <LayoutDashboard className="size-5" />
              </Button>
            </Link>
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
        <AddBillForm />
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
            <Link href={`/group/${encodeURIComponent(slug as string)}/members`}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-lg",
                  /^\/group\/[^\/]+\/members$/.test(pathname) ? "bg-muted" : "",
                )}
                aria-label="Members"
              >
                <Users className="size-5" />
              </Button>
            </Link>
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
