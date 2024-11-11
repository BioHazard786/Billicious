import { create } from "zustand";
import createSelectors from "./selectors";

type State = {
  currentSelectedTab: string;
};

type Action = {
  setCurrentSelectedTab: (tabName: string) => void;
  reset: () => void;
};

const initialState = {
  currentSelectedTab: "temporary",
};

const useMemberTabStoreBase = create<State & Action>((set) => ({
  ...initialState,
  setCurrentSelectedTab: (tabName) =>
    set(() => ({ currentSelectedTab: tabName })),
  reset: () => set(() => initialState),
}));

const useMemberTabStore = createSelectors(useMemberTabStoreBase);

export default useMemberTabStore;
