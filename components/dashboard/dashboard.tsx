"use client";

import { TMembers } from "@/lib/types";
import useSplitTabStore from "@/store/split-tab-store";
import { useEffect } from "react";
import EventName from "./event-name";
import ExpenseChart from "./expense-chart";
import RecentTransactions from "./recent-transactions";
import TotalExpense from "./total-expense";

const Dashboard = ({
  initialGroupMembers,
}: {
  initialGroupMembers: TMembers[];
}) => {
  const setInitialDraweeState = useSplitTabStore(
    (state) => state.setInitialDraweeState,
  );

  useEffect(() => {
    setInitialDraweeState(initialGroupMembers);
  }, []);

  return (
    <main className="relative grid h-full w-full grid-cols-1 gap-3 overflow-hidden p-3 md:grid-cols-2 lg:grid-cols-3 lg:pl-[4.2rem]">
      <EventName />
      <TotalExpense />
      <ExpenseChart />
      <RecentTransactions />
    </main>
  );
};

export default Dashboard;
