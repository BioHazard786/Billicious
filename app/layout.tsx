import Header from "@/components/layouts/header";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { db } from "@/database/dbConnect";
import { Notifications } from "@/lib/types";
import { checkDevice } from "@/lib/utils";
import { AppleDeviceProvider } from "@/providers/apple-device-provider";
import { NotificationStoreProvider } from "@/providers/notification-store-provider";
import QueryProvider from "@/providers/query-provider";
import ThemeProvider from "@/providers/theme-provider";
import { UserInfoStoreProvider } from "@/providers/user-info-store-provider";
import { getUser } from "@/server/actions";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getUserInvitesFromDB } from "./api/(invites)/utils";
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
  title: "Billicious | Simplify the calculation of splitting group expenses",
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
  const isAppleDevice = checkDevice(userAgent);
  const user = await getUser();
  let notifications: Notifications = [];

  if (user) {
    notifications = await db.transaction(async (transaction) => {
      return await getUserInvitesFromDB(transaction, user?.id);
    });
  }

  return (
    <html lang="en">
      <body
        className={`${GeistSans.className} ${GeistMono.variable} !pointer-events-auto scroll-smooth`}
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
                <NotificationStoreProvider notifications={notifications}>
                  <AppleDeviceProvider isAppleDevice={isAppleDevice}>
                    <Header />
                    <Toaster richColors position="top-center" />
                    <main>{children}</main>
                  </AppleDeviceProvider>
                </NotificationStoreProvider>
              </UserInfoStoreProvider>
            </TooltipProvider>
          </ThemeProvider>
        </QueryProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
