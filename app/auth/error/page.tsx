import { Button } from "@/components/ui/button";
import Mascot from "@/components/ui/mascot";
import { Home } from "lucide-react";
import Link from "next/link";
import React from "react";

interface PageProps {
  searchParams: Record<string, string>;
}

const Page: React.FC<PageProps> = ({ searchParams }) => {
  let title = "Something went wrong";
  let description =
    "There seems to be an issue with your access. Please check the details";
  if (searchParams?.type === "google") {
    title = "Google Sign-In Error";
    description = `There was an error while signing in with Google: ${searchParams.error}`;
  } else if (searchParams?.type === "signup") {
    title = "Email Verification Error";
    description = `There was an error while verifying your email: ${searchParams.error}`;
  } else if (searchParams?.type === "recovery") {
    title = "Password Recovery Error";
    description = `There was an error while recovering your password: ${searchParams.error}`;
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <div className="space-y-6 text-center">
        <h1 className="flex items-center justify-center gap-2 text-8xl font-extrabold text-primary md:text-9xl">
          <span>4</span>
          <Mascot className="size-[4.5rem] md:size-[7rem]" />
          <span>4</span>
        </h1>
        <h2 className="text-2xl font-semibold md:text-4xl">{title}</h2>
        <p className="max-w-lg text-sm text-muted-foreground md:text-base">
          {description}
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
};

export default Page;
