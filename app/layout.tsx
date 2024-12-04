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
  metadataBase: new URL(process.env.DOMAIN!),
  title: {
    default: "Billcious | Simplify Group Expense Splitting",
    template: "%s | Billcious",
  },
  description:
    "Effortlessly split bills, track group expenses, and settle debts with our user-friendly open-source expense sharing app.",
  applicationName: "Billicious",
  keywords: [
    "Bill Splitting App",
    "Split Bills Online",
    "Expense Sharing",
    "Group Payment Tool",
    "Debt Tracker",
    "Expense Management",
    "Split Bills with Friends",
    "Trip Expense Splitter",
    "Roommate Bill Sharing",
    "Group Finance Tracker",
  ],
  authors: [
    {
      name: "Mohd Zaid and Keshav Singh",
      url: "https://github.com/BioHazard786",
    },
  ],
  creator: "Mohd Zaid and Keshav Singh",
  publisher: "Mohd Zaid and Keshav Singh",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.DOMAIN!,
    title: "Billcious | Simplify Group Expense Splitting",
    description:
      "Effortlessly split bills, track group expenses, and settle debts with our user-friendly open-source expense sharing app.",
    siteName: "Billicious",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Billicious - Group Expense Splitting App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Billcious | Simplify Group Expense Splitting",
    description:
      "Effortlessly split bills, track group expenses, and settle debts with our user-friendly open-source expense sharing app.",
    images: ["/twitter-image.png"],
  },
  alternates: {
    canonical: process.env.DOMAIN!,
  },
  category: "Finance",
  generator: "Next.js",
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
