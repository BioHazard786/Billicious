"use client";

import Error404 from "@/components/ui/404";
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
    <html>
      <body>
        <div className="flex h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
          <div className="flex flex-col items-center justify-center gap-4 px-4">
            <Error404 className="size-32 md:size-48" />
            <div className="space-y-2 text-center">
              <p className="text-2xl font-semibold md:text-4xl">
                Page Not Found
              </p>
              <p className="max-w-lg text-sm text-muted-foreground md:text-base">
                Oops! The page you are looking for might have been removed, had
                its name changed, or is temporarily unavailable.
              </p>
            </div>
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
      </body>
    </html>
  );
}
