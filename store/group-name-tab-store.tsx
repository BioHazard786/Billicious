import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import createSelectors from "./selectors";

type State = {
  groupName: string;
  currency: string;
};

type Action = {
  setGroupName: (groupName: string) => void;
  setCurrency: (currency: string) => void;
  reset: () => void;
};

const initialState = {
  groupName: "",
  currency: "INR",
};

const useGroupNameTabStoreBase = createWithEqualityFn<State & Action>(
  (set) => ({
    ...initialState,
    setGroupName: (groupName) => set({ groupName }),
    setCurrency: (currency) => set({ currency }),
    reset: () => set(initialState),
  }),
  shallow,
);

const useGroupNameTabStore = createSelectors(useGroupNameTabStoreBase);

export default useGroupNameTabStore;
