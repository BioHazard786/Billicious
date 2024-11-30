import { signOut } from "@/server/actions";
import useUserInfoStore from "@/store/user-info-store";
import { LogOut, Settings, UserCog } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
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

const UserMenu = ({
  openDropdown,
  setOpenDropdown,
}: {
  openDropdown: string | null;
  setOpenDropdown: (value: string) => void;
}) => {
  const user = useUserInfoStore((state) => state.user);
  const { slug: groupId } = useParams();
  const pathName = usePathname();

  const handleSignOut = useCallback(() => {
    toast.promise(signOut(), {
      loading: "Signing Out...",
      success: "Sign Out Successfully",
      error: "Failed to Sign Out",
    });
  }, []);

  return (
    <DropdownMenu
      open={openDropdown === "user-menu-toggle"}
      onOpenChange={() => setOpenDropdown("user-menu-toggle")}
    >
      <DropdownMenuTrigger asChild>
        <Avatar className="size-8 cursor-pointer">
          <AvatarImage src={user!.avatar_url} alt={user!.name} />
          <AvatarFallback>{user!.name[0]}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[99]">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Avatar className="size-6 cursor-pointer">
            <AvatarImage src={user!.avatar_url} alt={user!.name} />
            <AvatarFallback>{user!.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span>{user?.name}</span>
            <span className="text-xs font-normal text-muted-foreground">
              @{user?.username}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {groupId && !pathName.startsWith("/view/group") && (
          <Link
            href={`/group/${encodeURIComponent(groupId as string)}/settings`}
          >
            <DropdownMenuItem className="cursor-pointer">
              Settings
              <DropdownMenuShortcut>
                <Settings className="size-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
        )}
        <Link href="/settings/account">
          <DropdownMenuItem className="cursor-pointer">
            Profile
            <DropdownMenuShortcut>
              <UserCog className="size-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
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
