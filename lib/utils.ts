import useAddBillStore from "@/store/add-bill-store";
import useContributionsTabStore from "@/store/contributions-tab-store";
import useDetailsTabStore from "@/store/details-tab-store";
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

export function formatDraweeAmount(drawees: string[], payeeBill: number) {
  const draweeBill = Math.floor((payeeBill / drawees.length) * 100) / 100;
  const formatedDrawees: { [key: string]: number } = {};
  for (let i of drawees) {
    formatedDrawees[i] = draweeBill;
  }
  return formatedDrawees;
}

export function removeDraweeAmount(
  draweeIndex: string,
  draweeAmount: { [key: string]: number },
) {
  delete draweeAmount[draweeIndex];
  const draweeBill =
    Math.floor(
      (totalPayeeBill(draweeAmount) / Object.keys(draweeAmount).length) * 100,
    ) / 100;
  for (let key in draweeAmount) {
    draweeAmount[key] = draweeBill;
  }
  console.log(draweeBill, draweeAmount);
  return draweeAmount;
}

export function formatDrawees(drawees: string[], payeeBill: number) {
  const formattedDrawees: { [key: string]: number } = {};
  const draweesCount = drawees.length;

  // Calculate the base bill for each drawee
  const baseBill = Math.floor((payeeBill / draweesCount) * 100) / 100;

  // Calculate total used amount and remainder for adjustment
  let used = baseBill * draweesCount;
  let remainder = Math.round((payeeBill - used) * 100) / 100;

  // Distribute the base bill and adjust for remainder in the same loop
  for (let i = 0; i < draweesCount; ++i) {
    let adjustedBill = baseBill;

    // Distribute the remaining cents (remainder) to the first few drawees
    if (remainder > 0) {
      adjustedBill = Math.round((adjustedBill + 0.01) * 100) / 100;
      remainder = Math.round((remainder - 0.01) * 100) / 100;
    }

    // Assign the adjusted value to the corresponding drawee
    formattedDrawees[drawees[i]] = adjustedBill;
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

export function resetBillFormStores() {
  useAddBillStore.getState().reset();
  useDetailsTabStore.getState().reset();
  useContributionsTabStore.getState().reset();
}
