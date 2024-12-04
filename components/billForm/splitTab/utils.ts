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

  const roundToTwoDecimals = (num: number) => Number(num.toFixed(2));

  const distributeRemainder = (
    drawees: Map<string, number>,
    remainder: number,
  ) => {
    if (remainder === 0) return drawees;

    const draweeKeys = Array.from(drawees.keys());
    let distributedRemainder = 0;
    let i = 0;

    while (distributedRemainder < remainder) {
      const draweeIndex = draweeKeys[i % draweeKeys.length];
      const currentAmount = drawees.get(draweeIndex)!;
      drawees.set(draweeIndex, roundToTwoDecimals(currentAmount + 0.01));
      distributedRemainder = roundToTwoDecimals(distributedRemainder + 0.01);
      i++;
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
      const sortedKeys = [...drawees.keys()].sort();
      const lastDraweeKey = sortedKeys[sortedKeys.length - 1];

      if (lastDraweeKey) {
        const currentAmount = drawees.get(lastDraweeKey)!;
        drawees.set(
          lastDraweeKey,
          roundToTwoDecimals(currentAmount + difference),
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
      drawees = adjustToTotal(drawees, payeesBill);

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
        draweesMap.set(draweeIndex, roundToTwoDecimals(amount));
      });

      const currentTotal = Array.from(draweesMap.values()).reduce(
        (sum, amount) => sum + amount,
        0,
      );

      let adjustedDrawees: Map<string, number>;

      if (currentTotal === 0) {
        // If all amounts are zero, split equally
        const draweesCount = draweesMap.size;
        const baseBill = roundToTwoDecimals(payeesBill / draweesCount);

        adjustedDrawees = new Map(
          Array.from(draweesMap.keys()).map((key) => [key, baseBill]),
        );

        const remainder = roundToTwoDecimals(
          payeesBill - baseBill * draweesCount,
        );

        adjustedDrawees = distributeRemainder(adjustedDrawees, remainder);
      } else {
        const scaleFactor = payeesBill / currentTotal;

        draweesMap.forEach((amount, draweeIndex) => {
          draweesMap.set(draweeIndex, roundToTwoDecimals(amount * scaleFactor));
        });

        adjustedDrawees = adjustToTotal(draweesMap, payeesBill);
      }

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
