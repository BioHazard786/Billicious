"use client";

import Loading from "@/app/loading";
import Logo from "@/components/ui/logo";
import Mascot from "@/components/ui/mascot";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";
import { cn } from "@/lib/utils";
import { signOut } from "@/server/actions";
import useUserInfoStore from "@/store/user-info-store";
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaGithub } from "react-icons/fa6";
import { toast } from "sonner";
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

const eligiblePaths = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/settings/account",
];

const Header = () => {
  const pathname = usePathname();
  const user = useUserInfoStore((state) => state.user);

  const handleSignOut = () => {
    toast.promise(signOut(), {
      loading: "Signing Out...",
      success: "Sign Out Succesfully",
      error: "Failed to Sign Out",
    });
  };

  return (
    <header className="fixed top-0 z-[75] flex h-[53px] w-full items-center border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {eligiblePaths.includes(pathname) && (
        <Link href="/">
          <Mascot className="h-8 cursor-pointer" />
        </Link>
      )}
      <Link href="/">
        <Logo
          className={cn(
            "h-8 cursor-pointer",
            eligiblePaths.includes(pathname) ? "ml-2" : "lg:ml-12",
          )}
        />
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
        {user !== null ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="ml-2 size-8 cursor-pointer">
                <AvatarImage src={user.avatar_url} alt={user.full_name} />
                <AvatarFallback>{user.full_name[0]}</AvatarFallback>
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
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer"
              >
                Sign Out
                <DropdownMenuShortcut>
                  <LogOut className="size-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
