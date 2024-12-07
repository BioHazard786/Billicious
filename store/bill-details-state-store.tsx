import { create } from "zustand";
import createSelectors from "./selectors";

type State = {
  isOpen: boolean;
};

type Action = {
  setIsOpen: (newState: boolean) => void;
  reset: () => void;
};

const initialState: State = {
  isOpen: false,
};

const useBillDeatilsStateBase = create<State & Action>((set) => ({
  ...initialState,
  setIsOpen: (newState) => set({ isOpen: newState }),
  reset: () => set(initialState),
}));

const useBillDeatilsState = createSelectors(useBillDeatilsStateBase);

export default useBillDeatilsState;
