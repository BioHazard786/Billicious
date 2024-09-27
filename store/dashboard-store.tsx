import { TBill, TGroupData, TMembers, TransactionT } from "@/lib/types";
import { produce } from "immer";
import { createContext, useContext } from "react";
import { createStore } from "zustand";
import { shallow } from "zustand/shallow";
import { useStoreWithEqualityFn } from "zustand/traditional";

type Action = {
  addBill: (bill: TBill) => void;
  addMember: (member: TMembers[]) => void;
  addTransaction: (transaction: TransactionT) => void;
};

export type DashboardStore = ReturnType<typeof createDashboardStore>;

export const createDashboardStore = (initialGroupData: TGroupData) => {
  return createStore<Action & TGroupData>()((set) => ({
    ...initialGroupData,
    addMember: (member: TMembers[]) =>
      set(
        produce((state: TGroupData) => {
          state.members.push(...member);
        }),
      ),
    addBill: (bill: TBill) =>
      set(
        produce((state: TGroupData) => {
          state.totalBill = bill.totalAmount;
          state.members = bill.updatedMembers;
        }),
      ),
    addTransaction: (transaction: TransactionT) =>
      set(
        produce((state: TGroupData) => {
          state.transactions = [transaction, ...state.transactions.slice(0, 8)];
        }),
      ),
  }));
};

export const DashboardStoreContext = createContext<DashboardStore | null>(null);

export default function useDashboardStore<T>(
  selector: (state: Action & TGroupData) => T,
): T {
  const store = useContext(DashboardStoreContext);
  if (!store)
    throw new Error("Missing DashboardStoreContext.Provider in the tree");
  return useStoreWithEqualityFn(store, selector, shallow);
}
