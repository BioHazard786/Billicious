"use client";

import Logo from "@/components/ui/logo";
import Mascot from "@/components/ui/mascot";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";
import { cn } from "@/lib/utils";
import useUserInfoStore from "@/store/user-info-store";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import Notifications from "../notifications/notifications";
import { Button } from "../ui/button";
import UserMenu from "../user/user-menu";

const Header = () => {
  const pathName = usePathname();
  const user = useUserInfoStore((state) => state.user);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  return (
    <header className="fixed top-0 z-[75] flex h-[53px] w-full items-center border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Link href="/">
        <Mascot className="size-8 cursor-pointer" />
      </Link>
      <Link href="/">
        <Logo className="ml-2 h-8 cursor-pointer" />
      </Link>
      <div className="ml-auto flex place-items-center justify-center gap-2">
        {user && <Notifications />}
        <ThemeToggleButton
          openDropdown={openDropdown}
          setOpenDropdown={handleToggle}
        />
        {user ? (
          <UserMenu
            openDropdown={openDropdown}
            setOpenDropdown={handleToggle}
          />
        ) : (
          <Link
            href={
              pathName === "/auth/signin" || pathName === "/auth/signup"
                ? { pathname: "/auth/signin" }
                : { pathname: "/auth/signin", query: { next: pathName } }
            }
          >
            <Button variant="default">Sign In</Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
