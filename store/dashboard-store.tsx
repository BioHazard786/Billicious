import { TGroupData, TMembers, TransactionT } from "@/lib/types";
import { produce } from "immer";
import { createContext, useContext } from "react";
import { createStore } from "zustand";
import { shallow } from "zustand/shallow";
import { useStoreWithEqualityFn } from "zustand/traditional";

type Action = {
  addBill: (bill: { totalAmount: number; updatedMemberData: any }) => void;
  addMember: (member: TMembers[]) => void;
  updateMember: (member: TMembers) => void;
  addTransaction: (transaction: TransactionT) => void;
  updateBackgroundUrl: (url: string) => void;
  makeAdmin: (userIndex: number) => void;
  removeAdmin: (userIndex: number) => void;
  removeInvite: (userIndex: number) => void;
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
    updateMember: (user: TMembers) =>
      set(
        produce((state: TGroupData) => {
          const index = state.members.findIndex(
            (member) => member.memberIndex === user.memberIndex,
          );
          if (index !== -1) {
            state.members[index] = user;
          }
        }),
      ),
    addBill: (bill) =>
      set(
        produce((state: TGroupData) => {
          state.totalBill = bill.totalAmount;
          bill.updatedMemberData.forEach((data: any) => {
            const member = state.members[data.userIndex];
            if (member) {
              member.balance = Number(data.totalPaid) - Number(data.totalSpent);
              member.totalPaid = Number(data.totalPaid);
            }
          });
        }),
      ),
    addTransaction: (transaction: TransactionT) =>
      set(
        produce((state: TGroupData) => {
          if (!state.transactions.some((t) => t.id === transaction.id)) {
            state.transactions.push(transaction);
            state.transactions.sort(
              (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
            );

            if (state.transactions.length > 9) {
              state.transactions = state.transactions.slice(0, 9);
            }
          }
        }),
      ),
    updateBackgroundUrl: (url: string) =>
      set(
        produce((state: TGroupData) => {
          state.backgroundUrl = url;
        }),
      ),
    makeAdmin: (userIndex: number) =>
      set(
        produce((state: TGroupData) => {
          state.members[userIndex].isAdmin = true;
        }),
      ),
    removeAdmin: (userIndex: number) =>
      set(
        produce((state: TGroupData) => {
          state.members[userIndex].isAdmin = false;
        }),
      ),
    removeInvite: (userIndex: number) =>
      set(
        produce((state: TGroupData) => {
          state.members[userIndex].memberId = state.id + " | " + userIndex;
          state.members[userIndex].status = 0;
          state.members[userIndex].username = undefined;
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
