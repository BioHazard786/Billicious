"use client";

import useDashboardStore from "@/store/dashboard-store";
import useSplitTabStore from "@/store/split-tab-store";
import { useEffect } from "react";
import EventName from "./event-name";
import ExpenseChart from "./expense-chart";
import RecentTransactions from "./recent-transactions";
import TotalExpense from "./total-expense";

const Dashboard = () => {
  const members = useDashboardStore((state) => state.members);
  const setInitialDraweeState = useSplitTabStore(
    (state) => state.setInitialDraweeState,
  );

  useEffect(() => {
    setInitialDraweeState(members);
  }, []);

  return (
    <main className="relative grid h-dvh w-full grid-cols-1 gap-3 overflow-x-hidden p-3 pt-[4.2rem] md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[auto_1fr] lg:pl-[4.2rem]">
      <EventName />
      <TotalExpense />
      <ExpenseChart />
      <RecentTransactions />
    </main>
  );
};

export default Dashboard;
