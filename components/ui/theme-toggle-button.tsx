"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { IoLaptop, IoMoon, IoSunny } from "react-icons/io5";

export default function ThemeToggleButton({
  openDropdown,
  setOpenDropdown,
}: {
  openDropdown: string | null;
  setOpenDropdown: (value: string) => void;
}) {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu
      open={openDropdown === "theme-toggle"}
      onOpenChange={() => setOpenDropdown("theme-toggle")}
    >
      <DropdownMenuTrigger asChild>
        <div className="relative inline-flex size-8 cursor-pointer items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
          <IoSunny className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <IoMoon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[99] text-muted-foreground">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center gap-2"
        >
          <IoSunny className="size-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center gap-2"
        >
          <IoMoon className="size-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center gap-2"
        >
          <IoLaptop className="size-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
