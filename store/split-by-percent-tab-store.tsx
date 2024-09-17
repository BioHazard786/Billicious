import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import createSelectors from "./selectors";

type State = {
  draweesSplitByPercent: Map<string, { percent: number; isEdited: boolean }>;
};

type Action = {
  setDraweesSplitByPercent: (
    draweesSplitByPercent: State["draweesSplitByPercent"],
  ) => void;
  reset: () => void;
};

const useSplitByPercentTabStoreBase = createWithEqualityFn<State & Action>(
  (set) => ({
    draweesSplitByPercent: new Map(),
    setDraweesSplitByPercent: (draweesSplitByPercent) =>
      set(() => ({
        draweesSplitByPercent: draweesSplitByPercent,
      })),
    reset: () =>
      set((state) => {
        state.draweesSplitByPercent.clear();
        return { draweesSplitByPercent: state.draweesSplitByPercent };
      }),
  }),
  shallow,
);

const useSplitByPercentTabStore = createSelectors(
  useSplitByPercentTabStoreBase,
);

export default useSplitByPercentTabStore;
