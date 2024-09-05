"use client";

import Logo from "@/components/ui/logo";
import Mascot from "@/components/ui/mascot";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { FaGithub } from "react-icons/fa6";

const Header = () => {
  const pathname = usePathname();
  return (
    <header className="fixed top-0 z-[75] flex h-[53px] w-full items-center border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {pathname === "/" && <Mascot className="h-8 cursor-pointer" />}
      <Logo className={cn("h-8", pathname === "/" ? "ml-2" : "lg:ml-12")} />
      <div className="ml-auto flex place-items-center justify-center">
        <a
          target="_blank"
          rel="noreferrer"
          href="https://github.com/BioHazard786"
        >
          <div className="inline-flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-md px-0 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            <FaGithub className="size-5" />
          </div>
        </a>
        <ThemeToggleButton />
      </div>
    </header>
  );
};

export default Header;
