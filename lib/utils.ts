import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TGroupData, TMembers } from "./types";

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

export function totalPayeeBill(payees: { [key: string]: number }) {
  let total = 0;
  for (let amount of Object.values(payees)) {
    total += amount;
  }
  return total;
}

export function formatDrawees(drawees: string[], payeeBill: number) {
  const formattedDrawees: { [key: string]: number } = {};
  const draweeBill = Math.round((payeeBill / drawees.length) * 100) / 100;
  for (let i of drawees) {
    formattedDrawees[i] = draweeBill;
  }
  return formattedDrawees;
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

export function formatGroupData(groupData: any): TGroupData {
  const members = formatMemberData(groupData.users);
  return {
    id: groupData.group.id,
    name: groupData.group.name,
    totalBill: parseFloat(groupData.group.totalExpense),
    members: members,
  };
}
