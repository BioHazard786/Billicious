import { create } from "zustand";
import createSelectors from "./selectors";

type State = {
  choice: "bill" | "payment" | null;
};

type Action = {
  setChoice: (choice: State["choice"]) => void;
  reset: () => void;
};

const initialState: State = {
  choice: null,
};

const useBillChoiceStoreBase = create<State & Action>((set) => ({
  ...initialState,
  setChoice: (choice) => set({ choice }),
  reset: () => set(initialState),
}));

const useBillChoiceStore = createSelectors(useBillChoiceStoreBase);

export default useBillChoiceStore;
