import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import createSelectors from "./selectors";

type State = {
  selectedPayee: string | undefined;
  selectedDrawee: string | undefined;
  amountToBePaid: number;
};

type Action = {
  setSelectedPayee: (payee: string) => void;
  setSelectedDrawee: (drawee: string) => void;
  setAmountToBePaid: (amount: number) => void;
  reset: () => void;
};

const initialState: State = {
  selectedPayee: undefined,
  selectedDrawee: undefined,
  amountToBePaid: 0,
};

const useChoiceTabStoreBase = createWithEqualityFn<State & Action>(
  (set) => ({
    ...initialState,
    setSelectedPayee: (payee) => set({ selectedPayee: payee }),
    setSelectedDrawee: (drawee) => set({ selectedDrawee: drawee }),
    setAmountToBePaid: (amount) => set({ amountToBePaid: amount }),
    reset: () => set(initialState),
  }),
  shallow,
);

const useChoiceTabStore = createSelectors(useChoiceTabStoreBase);

export default useChoiceTabStore;
