import {
  formatDraweeSplitByAmount,
  formatDraweeSplitByPercent,
  totalBill,
} from "@/components/billForm/splitTab/utils";
import useSplitByAmountTabStore from "@/store/split-by-amount-tab-store";
import useSplitByPercentTabStore from "@/store/split-by-percent-tab-store";
import useSplitEquallyTabStore from "@/store/split-equally-tab-store";
import { produce } from "immer";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import createSelectors from "./selectors";

type State = {
  payees: { [key: string]: number };
  payeesBill: number;
};

type Action = {
  setPayee: (payeeId: string, payeeAmount: number) => void;
  setMultiplePayees: (payees: State["payees"]) => void;
  deletePayee: (payeeId: string) => void;
  reset: () => void;
};

const useContributionsTabStoreBase = createWithEqualityFn<State & Action>(
  (set) => ({
    payees: {},
    payeesBill: 0,
    setPayee: (payeeId, payeeAmount) =>
      set(
        produce((state: State) => {
          state.payees[payeeId] = payeeAmount;
          state.payeesBill = totalBill(state.payees);
          const drawees = useSplitEquallyTabStore.getState().drawees;
          const setDraweesSplitByAmount =
            useSplitByAmountTabStore.getState().setDraweesSplitByAmount;
          const setDraweesSplitByPercent =
            useSplitByPercentTabStore.getState().setDraweesSplitByPercent;
          setDraweesSplitByAmount(
            formatDraweeSplitByAmount(drawees, state.payeesBill),
          );
          setDraweesSplitByPercent(formatDraweeSplitByPercent(drawees));
        }),
      ),
    setMultiplePayees: (payees) =>
      set(
        produce((state: State) => {
          state.payees = payees;
          state.payeesBill = totalBill(payees);
        }),
      ),
    deletePayee: (payeeId) =>
      set(
        produce((state: State) => {
          delete state.payees[payeeId];
          state.payeesBill = totalBill(state.payees);
          const drawees = useSplitEquallyTabStore.getState().drawees;
          const setDraweesSplitByAmount =
            useSplitByAmountTabStore.getState().setDraweesSplitByAmount;
          const setDraweesSplitByPercent =
            useSplitByPercentTabStore.getState().setDraweesSplitByPercent;
          setDraweesSplitByAmount(
            formatDraweeSplitByAmount(drawees, state.payeesBill),
          );
          setDraweesSplitByPercent(formatDraweeSplitByPercent(drawees));
        }),
      ),
    reset: () => set({ payees: {}, payeesBill: 0 }),
  }),

  shallow,
);

const useContributionsTabStore = createSelectors(useContributionsTabStoreBase);
export default useContributionsTabStore;
