"use client";

import { Button } from "@/components/ui/button";
import Mascot from "@/components/ui/mascot";
import { Home } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-background p-4 text-foreground">
      <div className="space-y-6 text-center">
        <h1 className="flex items-center justify-center gap-2 text-8xl font-extrabold text-primary md:text-9xl">
          <span>4</span>
          <Mascot className="size-[4.5rem] md:size-[7rem]" />
          <span>4</span>
        </h1>
        <h2 className="text-2xl font-semibold md:text-4xl">Page Not Found</h2>
        <p className="max-w-lg text-sm text-muted-foreground md:text-base">
          Oops! The page you are looking for might have been removed, had its
          name changed, or is temporarily unavailable.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Go back home
          </Link>
        </Button>
      </div>
      <div className="mt-16 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Billicious. All rights reserved.
      </div>
    </div>
  );
}
