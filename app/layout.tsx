import Header from "@/components/layouts/header";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { checkDevice } from "@/lib/utils";
import QueryProvider from "@/providers/query-provider";
import ThemeProvider from "@/providers/theme-provider";
import UserInfoStoreProvider from "@/providers/user-info-provider";
import { getUser } from "@/server/actions";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  keywords: [
    "Bill Splitting App",
    "Split Bills Online",
    "Expense Sharing App",
    "Group Payment Tool",
    "Shared Expenses Manager",
    "Split the Bill",
    "Group Expense Tracker",
    "Split Bills with Friends",
    "Group Finance App",
    "Roommate Expense Tracker",
    "Trip Expense Manager",
    "Shared Bills Calculator",
    "Automated Bill Splitting",
    "Settle Up Payments",
    "Group Spending Tracker",
    "Split Dinner Bill",
    "Shared Payment App",
    "Bill Splitting Made Easy",
    "Expense Splitter",
    "Group Cost Sharing",
  ],
  title: "Billcious | Simplify the calculation of splitting group expenses",
  description:
    "Split your bills easily! Billicious is an open-source Webapp built for tracking debts and payments quickly",
  applicationName: "Billicious",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/favicon-light.png",
        href: "/favicon-light.png",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/favicon-dark.png",
        href: "/favicon-dark.png",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const userAgent = headersList.get("user-agent") || "";
  const isApple = checkDevice(userAgent);
  const user = await getUser();

  return (
    <html lang="en" className={isApple ? "apple-device" : ""}>
      <body
        className={`${GeistSans.className} ${GeistMono.variable} scroll-smooth`}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <UserInfoStoreProvider user={user}>
                <Header />
                <Toaster richColors position="top-center" />
                <main>{children}</main>
              </UserInfoStoreProvider>
            </TooltipProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
