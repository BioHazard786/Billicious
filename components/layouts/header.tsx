"use client";

import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { FaGithub } from "react-icons/fa6";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { signOut } from "@/server/actions";
import useUserInfoStore from "@/store/user-info-store";

import Logo from "@/components/ui/logo";
import Mascot from "@/components/ui/mascot";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";
import { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const ELIGIBLE_PATHS = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/settings/account",
];

const Header = () => {
  const pathName = usePathname();
  const user = useUserInfoStore((state) => state.user);

  const handleSignOut = useCallback(() => {
    toast.promise(signOut(), {
      loading: "Signing Out...",
      success: "Sign Out Successfully",
      error: "Failed to Sign Out",
    });
  }, []);

  const showMascot = useMemo(
    () => ELIGIBLE_PATHS.includes(pathName) || user === null,
    [pathName, user],
  );

  const logoClassName = useMemo(
    () => cn("h-8 cursor-pointer", showMascot ? "ml-2" : "lg:ml-12"),
    [showMascot],
  );

  return (
    <header className="fixed top-0 z-[75] flex h-[53px] w-full items-center border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {showMascot && (
        <Link href="/">
          <Mascot className="h-8 cursor-pointer" />
        </Link>
      )}
      <Link href="/">
        <Logo className={logoClassName} />
      </Link>
      <div className="ml-auto flex place-items-center justify-center">
        <Link
          target="_blank"
          rel="noreferrer"
          href="https://github.com/BioHazard786"
        >
          <Button variant="ghost" size="icon">
            <FaGithub className="size-5" />
          </Button>
        </Link>
        <ThemeToggleButton />
        {user ? (
          <UserMenu user={user} onSignOut={handleSignOut} />
        ) : (
          <Link
            href={{
              pathname: "/auth/signin",
              query: { next: pathName },
            }}
          >
            <Button variant="default" className="ml-2">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};

const UserMenu = ({
  user,
  onSignOut,
}: {
  user: User;
  onSignOut: () => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Avatar className="ml-2 size-8 cursor-pointer">
        <AvatarImage src={user!.avatar_url} alt={user!.name} />
        <AvatarFallback>{user!.name[0]}</AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="z-[100]">
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <Link href="/settings/account">
        <DropdownMenuItem className="cursor-pointer">
          Settings
          <DropdownMenuShortcut>
            <Settings className="size-4" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </Link>
      <DropdownMenuItem onClick={onSignOut} className="cursor-pointer">
        Sign Out
        <DropdownMenuShortcut>
          <LogOut className="size-4" />
        </DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default Header;
