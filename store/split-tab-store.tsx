import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import createSelectors from "./selectors";

type State = {
  currentSelectedTab: string;
};

type Action = {
  setCurrentSelectedTab: (tabName: string) => void;
  reset: () => void;
};

const useSplitTabStoreBase = createWithEqualityFn<State & Action>(
  (set) => ({
    currentSelectedTab: "equally",
    setCurrentSelectedTab: (tabName) =>
      set(() => ({ currentSelectedTab: tabName })),
    reset: () =>
      set(() => ({
        currentSelectedTab: "equally",
      })),
  }),
  shallow,
);

const useSplitTabStore = createSelectors(useSplitTabStoreBase);

export default useSplitTabStore;
