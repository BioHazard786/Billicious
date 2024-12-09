import useAddBillStore from "@/store/add-bill-store";
import useMemberTabStore from "@/store/add-member-tab-store";
import useAddPaymentStore from "@/store/add-payment-store";
import useChocieTabStore from "@/store/choice-tab-store";
import useContributionsTabStore from "@/store/contributions-tab-store";
import useCreateGroupFormStore from "@/store/create-group-form-store";
import useCreateGroup from "@/store/create-group-store";
import useDetailsTabStore from "@/store/details-tab-store";
import useGroupImageTabStore from "@/store/group-image-tab-store";
import useGroupNameTabStore from "@/store/group-name-tab-store";
import usePaymentDetailsTabStore from "@/store/payment-details-tab-store";
import useSplitByAmountTabStore from "@/store/split-by-amount-tab-store";
import useSplitByPercentTabStore from "@/store/split-by-percent-tab-store";
import useSplitTabStore from "@/store/split-tab-store";
import useBillChoiceStore from "@/store/user-bill-choice-store";
import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNow } from "date-fns";
import {
  Banknote,
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
import { TGroupData, TMembers, TransactionT, userGroup } from "./types";

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
  const appleDevices = ["iPad", "iPhone", "iPod"];
  return appleDevices.some((device) => userAgent.includes(device));
}

export function formatMemberData(data: any): TMembers[] {
  const members = data.map((user: any) => ({
    name: user.userNameInGroup,
    memberId: user.userId,
    memberIndex: user.userIndex.toString(),
    username: user.username ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
    isAdmin: user.isAdmin,
    status: user.status,
    balance: Number(user.totalPaid) - Number(user.totalSpent),
    totalPaid: Number(user.totalPaid),
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
    drawees: transaction.draweesString
      ? transaction.draweesString.split("|").map(Number)
      : [],
    payees: transaction.payeesString
      ? transaction.payeesString.split("|").map(Number)
      : [],
  }));
  return transactions;
}

export function formatGroupData(groupData: any): TGroupData {
  const members = formatMemberData(groupData.members);
  const transactions = formatTransactionData(groupData.bills);
  return {
    id: groupData.group.id,
    name: groupData.group.name,
    totalBill: Number(groupData.group.totalExpense),
    members: members,
    transactions: transactions,
    currencyCode: groupData.group.currencyCode || "INR",
    backgroundUrl: groupData.group.backgroundUrl,
    createdAt: groupData.group.createdAt,
  };
}

export function resetBillFormStores() {
  useAddBillStore.getState().reset();
  useDetailsTabStore.getState().reset();
  useContributionsTabStore.getState().reset();
  useSplitTabStore.getState().reset();
  useSplitByAmountTabStore.getState().reset();
  useSplitByPercentTabStore.getState().reset();
  useChocieTabStore.getState().reset();
  usePaymentDetailsTabStore.getState().reset();
  useAddPaymentStore.getState().reset();
  useBillChoiceStore.getState().reset();
}

export function resetGroupFormStores() {
  useCreateGroup.getState().reset();
  useCreateGroupFormStore.getState().reset();
  useGroupNameTabStore.getState().reset();
  useGroupImageTabStore.getState().reset();
  useMemberTabStore.getState().reset();
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
  Payment: { icon: Banknote, color: "jade" },
  Transport: { icon: Bus, color: "brown" },
  Lodging: { icon: Bed, color: "amber" },
  Shopping: { icon: ShoppingCart, color: "tomato" },
  Entertain: { icon: Tv, color: "crimson" },
  Food: { icon: UtensilsCrossed, color: "purple" },
  Drinks: { icon: GlassWater, color: "indigo" },
  Snacks: { icon: Pizza, color: "teal" },
  Tickets: { icon: Ticket, color: "mint" },
  Others: { icon: Wallet, color: "lime" },
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
    sizeType === "accurate"
      ? (accurateSizes[i] ?? "Bytest")
      : (sizes[i] ?? "Bytes")
  }`;
}

export function convertToJpgExtension(filename?: string) {
  if (!filename) return "unnamed.jpg";
  const baseFilename = filename.split(/[/\\]/).pop() || "";

  // Sanitize the filename: remove invalid characters and trim
  const sanitized = baseFilename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_{2,}/g, "_")
    .trim();

  if (sanitized.length === 0) return "unnamed.jpg";

  const lastDotIndex = sanitized.lastIndexOf(".");
  const name = lastDotIndex > 0 ? sanitized.slice(0, lastDotIndex) : sanitized;
  const ext = lastDotIndex > 0 ? sanitized.slice(lastDotIndex + 1) : "";
  const newName = name.replace(/\s+/g, "%20");
  return ext.toLowerCase() === "jpg" ? `${newName}.jpg` : `${newName}.jpg`;
}

export function formatUserGroupsData(data: any): userGroup[] {
  const userGroups: userGroup[] = data.map((group: any) => ({
    groupId: group.groupId,
    userNameInGroup: group.userNameInGroup,
    balance: Number(group.totalPaid) - Number(group.totalSpent),
    totalPaid: Number(group.totalPaid),
    totalExpense: Number(group.totalExpense),
    groupName: group.groupName,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    currencyCode: group.currencyCode,
    backgroundUrl: group.backgroundUrl,
    isAdmin: group.isAdmin,
  }));
  return userGroups;
}

export function timeAgo(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
