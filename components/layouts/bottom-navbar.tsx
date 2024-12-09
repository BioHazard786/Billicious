"use client";

import AddBillForm from "@/components/billForm/add-bill-form";
import { Button } from "@/components/ui/button";
import { NavItemProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Handshake,
  LayoutDashboard,
  PieChart,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { memo, useMemo, useState } from "react";

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

const BottomNavbar = ({
  removeBillForm = false,
}: {
  removeBillForm?: boolean;
}) => {
  const pathname = usePathname();
  const { slug } = useParams();
  const groupId = useMemo(() => slug as string, [slug]);
  const navPath = removeBillForm ? "/view/group" : "/group";
  const [isOpen, setIsOpen] = useState(false);

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
    <nav className="fixed bottom-0 z-[75] flex w-full items-center justify-between border-t bg-background px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
      {navItems.slice(0, 2).map((item) => (
        <NavItem key={item.label} {...item} />
      ))}
      {!removeBillForm && (
        <AddBillForm isOpen={isOpen} setIsOpen={setIsOpen}>
          <Button
            variant="default"
            size="icon"
            className="rounded-lg"
            aria-label="Add-Transactions"
          >
            <Plus className="size-5" />
          </Button>
        </AddBillForm>
      )}
      {navItems.slice(2).map((item) => (
        <NavItem key={item.label} {...item} />
      ))}
    </nav>
  );
};

export default memo(BottomNavbar);
