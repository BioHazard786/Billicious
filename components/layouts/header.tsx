"use client";

import { createClient } from "@/auth-utils/client";
import Logo from "@/components/ui/logo";
import Mascot from "@/components/ui/mascot";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";
import useUserInfoStore from "@/store/user-info-store";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Notifications from "../notifications/notifications";
import { Button } from "../ui/button";
import UserMenu from "../user/user-menu";

const Header = () => {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const pathName = usePathname();
  const { slug: groupId } = useParams();
  const router = useRouter();
  const user = useUserInfoStore((state) => state.user);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const channel = supabase
      .channel("realtime groups")
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "groups_table",
        },
        async (payload) => {
          if (groupId && payload.old.id === groupId) {
            if (pathName !== "/") {
              if (pathName.startsWith("/view/group"))
                router.replace("/view/group/error");
              else {
                queryClient.refetchQueries({
                  queryKey: ["homepage", user!.id],
                  exact: true,
                });
                router.replace("/");
              }
              toast.info("This group has been deleted");
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
