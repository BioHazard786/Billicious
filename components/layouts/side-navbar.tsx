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
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { memo, useMemo } from "react";

const NavItem = ({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className={cn("rounded-lg", active && "bg-muted")}
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

const SideNavbar = () => {
  const pathname = usePathname();
  const { slug } = useParams();
  const groupId = useMemo(() => slug as string, [slug]);

  const navItems = [
    {
      href: `/group/${encodeURIComponent(groupId)}`,
      icon: LayoutDashboard,
      label: "Dashboard",
      isActive: pathname === `/group/${groupId}`,
    },
    {
      href: `/group/${encodeURIComponent(groupId)}/activities`,
      icon: Handshake,
      label: "Settle",
      isActive: pathname === `/group/${groupId}/activities`,
    },
    {
      href: `/group/${encodeURIComponent(groupId)}/expenses`,
      icon: PieChart,
      label: "Expenses",
      isActive: pathname === `/group/${groupId}/expenses`,
    },

    {
      href: `/group/${encodeURIComponent(groupId)}/members`,
      icon: Users,
      label: "Members",
      isActive: pathname === `/group/${groupId}/members`,
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-[76] hidden h-full flex-col border-r border-border lg:flex">
      <div className="p-2 pt-[0.6rem]">
        <Mascot className="cursor-pointer" />
      </div>
      <nav className="grid gap-3 p-2">
        {navItems.slice(0, 2).map(({ href, icon, label, isActive }) => (
          <NavItem
            key={label}
            href={href}
            icon={icon}
            label={label}
            active={isActive}
          />
        ))}
        <AddBillForm />
        {navItems.slice(2).map(({ href, icon, label, isActive }) => (
          <NavItem
            key={label}
            href={href}
            icon={icon}
            label={label}
            active={isActive}
          />
        ))}
      </nav>
    </aside>
  );
};

export default memo(SideNavbar);
