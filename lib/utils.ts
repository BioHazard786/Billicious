import useAddBillStore from "@/store/add-bill-store";
import useContributionsTabStore from "@/store/contributions-tab-store";
import useDetailsTabStore from "@/store/details-tab-store";
import useSplitByAmountTabStore from "@/store/split-by-amount-tab-store";
import useSplitByPercentTabStore from "@/store/split-by-percent-tab-store";
import useSplitEquallyTabStore from "@/store/split-equally-tab-store";
import useSplitTabStore from "@/store/split-tab-store";
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

export function totalBill(bills: { [key: string]: number }) {
  let total = 0;
  for (let amount of Object.values(bills)) {
    total += amount;
  }
  return total;
}

export function formatDraweeSplitByAmount(
  drawees: string[],
  payeeBill: number,
) {
  const draweeBill = payeeBill / drawees.length;
  const formatedDrawees = new Map<
    string,
    { amount: number; isEdited: boolean }
  >();
  for (let i of drawees) {
    formatedDrawees.set(i, { amount: draweeBill, isEdited: false });
  }
  return formatedDrawees;
}

export function formatDraweeSplitByPercent(drawees: string[]) {
  const draweePercent = Math.floor(100 / drawees.length);

  const formatedDrawees = new Map<
    string,
    { percent: number; isEdited: boolean }
  >();
  drawees.forEach((drawee) => {
    // formatedDrawees[drawee] = { percent: draweePercent, isEdited: false };
    formatedDrawees.set(drawee, { percent: draweePercent, isEdited: false });
  });
  return formatedDrawees;
}

export function removeDraweeAmount(
  draweeIndex: string,
  draweeAmount: Map<string, { amount: number; isEdited: boolean }>,
  payeeBill: number,
) {
  // Remove the specified drawee
  draweeAmount.delete(draweeIndex);

  const remainingDrawees = draweeAmount.size;
  if (remainingDrawees === 0) {
    return draweeAmount;
  }

  const draweeBill = payeeBill / remainingDrawees;

  for (const key of draweeAmount.keys()) {
    draweeAmount.set(key, { amount: draweeBill, isEdited: false });
  }

  return draweeAmount;
}

export function addDraweeAmount(
  draweeIndex: string,
  draweeAmount: Map<string, { amount: number; isEdited: boolean }>,
  payeeBill: number,
) {
  const totalDrawees = draweeAmount.size + 1;
  const draweeBill = payeeBill / totalDrawees;
  draweeAmount.forEach((value, key) => {
    draweeAmount.set(key, { amount: draweeBill, isEdited: false });
  });
  draweeAmount.set(draweeIndex, { amount: draweeBill, isEdited: false });
  return draweeAmount;
}

export function removeDraweePercent(
  draweeIndex: string,
  draweesSplitByPercent: Map<string, { percent: number; isEdited: boolean }>,
) {
  // Remove the specified drawee
  draweesSplitByPercent.delete(draweeIndex);

  const remainingDrawees = draweesSplitByPercent.size;
  if (remainingDrawees === 0) {
    return draweesSplitByPercent;
  }

  const draweePercent = Math.floor(100 / remainingDrawees);

  for (const key of draweesSplitByPercent.keys()) {
    draweesSplitByPercent.set(key, {
      percent: draweePercent,
      isEdited: false,
    });
  }

  return draweesSplitByPercent;
}

export function addDraweePercent(
  draweeIndex: string,
  draweesSplitByPercent: Map<string, { percent: number; isEdited: boolean }>,
) {
  const totalDrawees = draweesSplitByPercent.size + 1;
  const draweePercent = Math.floor(100 / totalDrawees);
  draweesSplitByPercent.forEach((value, key) => {
    draweesSplitByPercent.set(key, {
      percent: draweePercent,
      isEdited: false,
    });
  });
  draweesSplitByPercent.set(draweeIndex, {
    percent: draweePercent,
    isEdited: false,
  });

  return draweesSplitByPercent;
}

export function modifyDraweeAmount(
  draweeIndex: string,
  draweeInputAmount: number,
  draweeAmountState: Map<string, { amount: number; isEdited: boolean }>,
  payeeBill: number,
) {
  // Set the new amount for the specified drawee
  draweeAmountState.set(draweeIndex, {
    amount: draweeInputAmount,
    isEdited: true,
  });

  let editedDraweesTotal = 0;
  const unEditedDrawees: string[] = [];

  // Calculate totals in a single loop
  for (const [index, draweeInfo] of draweeAmountState) {
    if (draweeInfo.isEdited) {
      editedDraweesTotal += draweeInfo.amount;
    } else {
      unEditedDrawees.push(index);
    }
  }

  const difference = payeeBill - editedDraweesTotal;

  if (difference < 0) {
    // Set all unedited drawees to 0
    unEditedDrawees.forEach((index) =>
      draweeAmountState.set(index, { amount: 0, isEdited: false }),
    );
    return { draweeAmountState, error: true };
  }

  if (unEditedDrawees.length > 0) {
    const leftAmount = difference / unEditedDrawees.length;
    unEditedDrawees.forEach((index) =>
      draweeAmountState.set(index, { amount: leftAmount, isEdited: false }),
    );
  }

  return { draweeAmountState, error: false };
}

export function modifyDraweePercent(
  draweeIndex: string,
  draweeInputPercent: number,
  draweePercentState: Map<string, { percent: number; isEdited: boolean }>,
) {
  // Set the new percent for the specified drawee
  draweePercentState.set(draweeIndex, {
    percent: draweeInputPercent,
    isEdited: true,
  });

  const unEditedDrawees: string[] = [];
  let editedDraweesTotalPercent = 0;
  let remainingDraweesPercent = 0;

  // Calculate totals in a single loop
  for (let [index, draweeInfo] of draweePercentState) {
    if (draweeInfo.isEdited) editedDraweesTotalPercent += draweeInfo.percent;
    else unEditedDrawees.push(index);
    if (index !== draweeIndex) remainingDraweesPercent += draweeInfo.percent;
  }

  const difference = 100 - editedDraweesTotalPercent;

  if (difference < 0 || unEditedDrawees.length === 0) {
    // Redistribute percentages proportionally
    const scaleFactor = (100 - draweeInputPercent) / remainingDraweesPercent;
    for (const [index, draweeInfo] of draweePercentState) {
      if (index !== draweeIndex) {
        draweePercentState.set(index, {
          ...draweeInfo,
          percent: Math.round(draweeInfo.percent * scaleFactor),
        });
      }
    }
  } else {
    const leftPercent = Math.round(difference / unEditedDrawees.length);
    for (const index of unEditedDrawees) {
      draweePercentState.set(index, { percent: leftPercent, isEdited: false });
    }
  }

  return draweePercentState;
}

export function formatDrawees(
  draweesSplitEqually: string[],
  draweesSplitByAmount: Map<string, { amount: number; isEdited: boolean }>,
  draweesSplitByPercent: Map<string, { percent: number; isEdited: boolean }>,
  payeesBill: number,
  currentSelectedTab: string,
): { [key: string]: number } {
  const formattedDrawees: { [key: string]: number } = {};

  const roundToTwoDecimals = (num: number) => Math.round(num * 100) / 100;

  const distributeRemainder = (
    drawees: Map<string, number>,
    remainder: number,
  ) => {
    for (const [draweeIndex, amount] of drawees) {
      if (remainder > 0) {
        drawees.set(draweeIndex, roundToTwoDecimals(amount + 0.01));
        remainder = roundToTwoDecimals(remainder - 0.01);
      } else {
        break;
      }
    }
    return drawees;
  };

  const adjustToTotal = (drawees: Map<string, number>, total: number) => {
    const currentTotal = Array.from(drawees.values()).reduce(
      (sum, amount) => sum + amount,
      0,
    );
    const difference = roundToTwoDecimals(total - currentTotal);
    if (difference !== 0) {
      const lastDraweeKey = [...drawees.keys()].pop();
      if (lastDraweeKey) {
        drawees.set(
          lastDraweeKey,
          roundToTwoDecimals(drawees.get(lastDraweeKey)! + difference),
        );
      }
    }
    return drawees;
  };

  switch (currentSelectedTab) {
    case "equally":
      const draweesCount = draweesSplitEqually.length;
      const baseBill = roundToTwoDecimals(payeesBill / draweesCount);
      let drawees = new Map(
        draweesSplitEqually.map((drawee) => [drawee, baseBill]),
      );
      const remainder = roundToTwoDecimals(
        payeesBill - baseBill * draweesCount,
      );
      drawees = distributeRemainder(drawees, remainder);
      drawees.forEach((amount, drawee) => (formattedDrawees[drawee] = amount));
      break;

    case "amount":
    case "percent":
      const sourceMap =
        currentSelectedTab === "amount"
          ? draweesSplitByAmount
          : draweesSplitByPercent;
      const draweesMap = new Map<string, number>();
      sourceMap.forEach((info, draweeIndex) => {
        const amount =
          currentSelectedTab === "amount"
            ? "amount" in info
              ? info.amount
              : 0
            : "percent" in info
              ? (info.percent * payeesBill) / 100
              : 0;
        draweesMap.set(draweeIndex, amount);
      });
      const scaleFactor =
        payeesBill /
        Array.from(draweesMap.values()).reduce(
          (sum, amount) => sum + amount,
          0,
        );
      draweesMap.forEach((amount, draweeIndex) => {
        draweesMap.set(draweeIndex, roundToTwoDecimals(amount * scaleFactor));
      });
      const adjustedDrawees = adjustToTotal(draweesMap, payeesBill);
      adjustedDrawees.forEach((amount, draweeIndex) => {
        formattedDrawees[draweeIndex] = amount;
      });
      break;
  }

  return formattedDrawees;
}

export function recalculatePayeesBills(
  payees: { [key: string]: number },
  draweeAmountState: Map<string, { amount: number; isEdited: boolean }>,
  payeesBill: number,
  setMultiplePayees: (payees: { [key: string]: number }) => void,
) {
  const totalDraweeBill = Array.from(draweeAmountState.values()).reduce(
    (sum, drawee) => sum + drawee.amount,
    0,
  );

  const scaleFactor = totalDraweeBill / payeesBill;

  const updatedPayees = Object.fromEntries(
    Object.entries(payees).map(([payeeIndex, amount]) => [
      payeeIndex,
      Math.round(amount * scaleFactor * 100) / 100,
    ]),
  );

  setMultiplePayees(updatedPayees);
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
  useSplitTabStore.getState().reset();
  useSplitByAmountTabStore.getState().reset();
  useSplitByPercentTabStore.getState().reset();
}
