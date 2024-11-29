"use client";

import { Handshake, LayoutDashboard, PieChart, Users } from "lucide-react";

import AddBillForm from "@/components/billForm/add-bill-form";
import { Button } from "@/components/ui/button";
import Mascot from "@/components/ui/mascot";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavItemProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { memo, useMemo } from "react";

const NavItem = ({ href, icon: Icon, label, isActive }: NavItemProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className={cn("rounded-lg", isActive && "bg-muted")}
        aria-label={label}
        asChild
      >
        <Link href={href}>
          <Icon className="size-5" />
        </Link>
      </Button>
    </TooltipTrigger>
    <TooltipContent side="right" sideOffset={5}>
      {label}
    </TooltipContent>
  </Tooltip>
);

const SideNavbar = ({
  removeBillForm = false,
}: {
  removeBillForm?: boolean;
}) => {
  const pathname = usePathname();
  const { slug } = useParams();
  const groupId = useMemo(() => slug as string, [slug]);
  const navPath = removeBillForm ? "/view/group" : "/group";

  const navItems = [
    {
      href: `${navPath}/${encodeURIComponent(groupId)}`,
      icon: LayoutDashboard,
      label: "Dashboard",
      isActive: pathname === `${navPath}/${groupId}`,
    },
    {
      href: `${navPath}/${encodeURIComponent(groupId)}/settle`,
      icon: Handshake,
      label: "Settle",
      isActive: pathname === `${navPath}/${groupId}/settle`,
    },
    {
      href: `${navPath}/${encodeURIComponent(groupId)}/expenses`,
      icon: PieChart,
      label: "Expenses",
      isActive: pathname === `${navPath}/${groupId}/expenses`,
    },

    {
      href: `${navPath}/${encodeURIComponent(groupId)}/members`,
      icon: Users,
      label: "Members",
      isActive: pathname === `${navPath}/${groupId}/members`,
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-[76] hidden h-full flex-col border-r border-border lg:flex">
      <div className="p-2 pt-[0.6rem]">
        <Link href="/">
          <Mascot className="cursor-pointer" />
        </Link>
      </div>
      <nav className="grid gap-3 p-2">
        {navItems.slice(0, 2).map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
        {!removeBillForm && <AddBillForm />}
        {navItems.slice(2).map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </nav>
    </aside>
  );
};

export default memo(SideNavbar);
