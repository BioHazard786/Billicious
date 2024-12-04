function formatDrawees(
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

// Test cases
const testCases = [
  {
    payeesBill: 0.399999999999999997,
    draweesSplitEqually: ["a", "b", "c"],
    tab: "equally",
  },
  {
    payeesBill: 100,
    draweesSplitByAmount: new Map([
      ["a", { amount: 0, isEdited: false }],
      ["b", { amount: 0, isEdited: false }],
      ["c", { amount: 0, isEdited: false }],
    ]),
    tab: "amount",
  },
];

testCases.forEach((testCase) => {
  const drawees = formatDrawees(
    testCase.draweesSplitEqually || [],
    testCase.draweesSplitByAmount || new Map(),
    new Map(),
    testCase.payeesBill,
    testCase.tab,
  );

  console.log(
    `Bill: ${testCase.payeesBill}`,
    `Total Split: ${Object.values(drawees).reduce((acc, value) => acc + value, 0)}`,
    `Drawees: `,
    drawees,
  );
});
