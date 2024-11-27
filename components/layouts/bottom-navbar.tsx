"use client";

import AddBillForm from "@/components/billForm/add-bill-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Activity,
  Handshake,
  LayoutDashboard,
  LucideIcon,
  PieChart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { memo, useMemo } from "react";

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
}

const NavItem = ({ href, icon: Icon, label, isActive }: NavItemProps) => (
  <Link href={href} className="flex flex-col items-center gap-1">
    <Button
      variant="ghost"
      size="icon"
      className={cn("rounded-lg", isActive && "bg-muted")}
      aria-label={label}
    >
      <Icon className={cn("size-5", !isActive && "text-muted-foreground")} />
    </Button>
    <span className={cn("text-xs", !isActive && "text-muted-foreground")}>
      {label}
    </span>
  </Link>
);

const BottomNavbar = () => {
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
      href: `/group/${encodeURIComponent(groupId)}/settle`,
      icon: Handshake,
      label: "Settle",
      isActive: pathname === `/group/${groupId}/settle`,
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
    <nav className="fixed bottom-0 z-[75] flex w-full items-center justify-between border-t bg-background px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
      {navItems.slice(0, 2).map((item) => (
        <NavItem key={item.label} {...item} />
      ))}
      <AddBillForm />
      {navItems.slice(2).map((item) => (
        <NavItem key={item.label} {...item} />
      ))}
    </nav>
  );
};

export default memo(BottomNavbar);
