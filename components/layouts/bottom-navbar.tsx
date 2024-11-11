"use client";

import AddBillForm from "@/components/billForm/add-bill-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useUserInfoStore from "@/store/user-info-store";
import {
  Activity,
  LayoutDashboard,
  LucideIcon,
  PieChart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";

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
  const { slug } = useParams<{ slug: string }>();
  const user = useUserInfoStore((state) => state.user);

  const navItems = useMemo(
    () => [
      {
        href: `/group/${encodeURIComponent(slug)}`,
        icon: LayoutDashboard,
        label: "Dashboard",
        isActive: pathname === `/group/${slug}`,
      },
      {
        href: `/group/${encodeURIComponent(slug)}/expenses`,
        icon: PieChart,
        label: "Expenses",
        isActive: pathname === `/group/${slug}/expenses`,
      },
      {
        href: `/group/${encodeURIComponent(slug)}/activities`,
        icon: Activity,
        label: "Activities",
        isActive: pathname === `/group/${slug}/activities`,
      },
      {
        href: `/group/${encodeURIComponent(slug)}/members`,
        icon: Users,
        label: "Members",
        isActive: pathname === `/group/${slug}/members`,
      },
    ],
    [slug, pathname],
  );

  if (!user) return null;

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

export default BottomNavbar;
