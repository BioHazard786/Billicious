import { produce } from "immer";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

type State = {
  payees: { [key: string]: number };
};

type Action = {
  setPayees: (payeeId: string, payeeAmount: number) => void;
  deletePayee: (payeeId: string) => void;
  reset: () => void;
};

const useContributionsTabStore = createWithEqualityFn<State & Action>(
  (set) => ({
    payees: {},
    setPayees: (payeeId, payeeAmount) =>
      set(
        produce((state) => {
          state.payees[payeeId] = payeeAmount;
        }),
      ),
    deletePayee: (payeeId) =>
      set(
        produce((state) => {
          delete state.payees[payeeId];
        }),
      ),
    reset: () => set({ payees: {} }),
  }),

  shallow,
);

export default useContributionsTabStore;
