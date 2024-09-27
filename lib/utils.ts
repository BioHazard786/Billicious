import useAddBillStore from "@/store/add-bill-store";
import useContributionsTabStore from "@/store/contributions-tab-store";
import useDetailsTabStore from "@/store/details-tab-store";
import useSplitByAmountTabStore from "@/store/split-by-amount-tab-store";
import useSplitByPercentTabStore from "@/store/split-by-percent-tab-store";
import useSplitTabStore from "@/store/split-tab-store";
import { clsx, type ClassValue } from "clsx";
import {
  Bed,
  Bus,
  GlassWater,
  LucideProps,
  Pizza,
  ShoppingCart,
  Ticket,
  Tv,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { twMerge } from "tailwind-merge";
import { TGroupData, TMembers, TransactionT } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function titleCase(str: string) {
  return str
    .split(" ")
    .map(function (word: string) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export function checkDevice(userAgent: string): boolean {
  const appleDevices = [
    "iPad",
    "iPhone",
    "iPod",
    "Macintosh",
    "MacIntel",
    "MacPPC",
    "Mac68K",
  ];
  return appleDevices.some((device) => userAgent.includes(device));
}

export function isAppleDevice(): boolean {
  const element = document.querySelector("html");
  return element ? element.classList.contains("apple-device") : false;
}

export function formatMemberData(data: any): TMembers[] {
  const members = data.map((user: any) => ({
    name: user.userNameInGroup,
    memberId: user.userId.toString(),
    memberIndex: user.userIndex,
    balance: parseFloat(user.totalPaid) - parseFloat(user.totalSpent),
    totalPaid: parseFloat(user.totalPaid),
  }));
  return members;
}

export function formatTransactionData(data: any): TransactionT[] {
  const transactions = data.map((transaction: any) => ({
    name: transaction.name,
    id: transaction.id,
    amount: parseFloat(transaction.amount),
    notes: transaction.notes,
    isPayment: transaction.isPayment,
    category: transaction.category,
    createdAt: new Date(transaction.createdAt),
    drawees: transaction.drawees.map(
      (drawee: { userIndex: any }) => drawee.userIndex,
    ),
    payees: transaction.payees.map(
      (payee: { userIndex: any }) => payee.userIndex,
    ),
  }));
  return transactions;
}

export function formatGroupData(groupData: any): TGroupData {
  const members = formatMemberData(groupData.users);
  const transactions = formatTransactionData(groupData.bills);
  return {
    id: groupData.group.id,
    name: groupData.group.name,
    totalBill: parseFloat(groupData.group.totalExpense),
    members: members,
    transactions: transactions,
  };
}

export function resetBillFormStores() {
  useAddBillStore.getState().reset();
  useDetailsTabStore.getState().reset();
  useContributionsTabStore.getState().reset();
  useSplitTabStore.getState().reset();
  useSplitByAmountTabStore.getState().reset();
  useSplitByPercentTabStore.getState().reset();
}

export const categories: Record<
  string,
  {
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
    color: string;
  }
> = {
  Transport: { icon: Bus, color: "#22d3ee" },
  Lodging: { icon: Bed, color: "#60a5fa" },
  Shopping: { icon: ShoppingCart, color: "#2dd4bf" },
  Entertain: { icon: Tv, color: "#fbbf24" },
  Food: { icon: UtensilsCrossed, color: "#fb923c" },
  Drinks: { icon: GlassWater, color: "#f87171" },
  Snacks: { icon: Pizza, color: "#f472b6" },
  Tickets: { icon: Ticket, color: "#c084fc" },
  Others: { icon: Wallet, color: "#818cf8" },
};

export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: "accurate" | "normal";
  } = {},
) {
  const { decimals = 0, sizeType = "normal" } = opts;

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const accurateSizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === "accurate" ? accurateSizes[i] ?? "Bytest" : sizes[i] ?? "Bytes"
  }`;
}
