import { signOut } from "@/server/actions";
import useUserInfoStore from "@/store/user-info-store";
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useCallback } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const UserMenu = () => {
  const user = useUserInfoStore((state) => state.user);
  const handleSignOut = useCallback(() => {
    toast.promise(signOut(), {
      loading: "Signing Out...",
      success: "Sign Out Successfully",
      error: "Failed to Sign Out",
    });
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-8 cursor-pointer">
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
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          Sign Out
          <DropdownMenuShortcut>
            <LogOut className="size-4" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
