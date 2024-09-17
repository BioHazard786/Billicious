import { produce } from "immer";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import createSelectors from "./selectors";

type State = {
  draweesSplitByAmount: Map<string, { amount: number; isEdited: boolean }>;
  isErroredOut: boolean;
};

type Action = {
  setDraweesSplitByAmount: (
    draweesSplitByAmount: State["draweesSplitByAmount"],
  ) => void;
  setIsError: () => void;
  reset: () => void;
};

const useSplitByAmountTabStoreBase = createWithEqualityFn<State & Action>(
  (set) => ({
    draweesSplitByAmount: new Map(),
    isErroredOut: false,
    setDraweesSplitByAmount: (draweesSplitByAmount) =>
      set(() => ({
        draweesSplitByAmount: draweesSplitByAmount,
      })),
    setIsError: () => set(() => ({ isErroredOut: true })),
    reset: () =>
      set((state) => {
        state.draweesSplitByAmount.clear();
        return {
          draweesSplitByPercent: state.draweesSplitByAmount,
          isErroredOut: false,
        };
      }),
  }),
  shallow,
);

const useSplitByAmountTabStore = createSelectors(useSplitByAmountTabStoreBase);

export default useSplitByAmountTabStore;
