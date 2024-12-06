"use client";

import useDashboardStore from "@/store/dashboard-store";
import useSplitEquallyTabStore from "@/store/split-equally-tab-store";
import { useEffect } from "react";
import EventName from "./event-name";
import ExpenseChart from "./expense-chart";
import RecentTransactions from "./recent-transactions";
import TotalExpense from "./total-expense";

const Dashboard = () => {
  const members = useDashboardStore((state) => state.members);
  const setInitialDraweeState = useSplitEquallyTabStore.getState().reset;

  useEffect(() => {
    setInitialDraweeState(members);
  }, [members, setInitialDraweeState]);

  return (
    <main className="relative grid h-full w-full grid-cols-1 gap-3 overflow-x-hidden p-3 pb-[5.563rem] pt-[4.063rem] md:grid-cols-2 lg:h-dvh lg:grid-cols-3 lg:grid-rows-[auto_1fr] lg:pb-3 lg:pl-[4.313rem]">
      <EventName />
      <TotalExpense />
      <ExpenseChart />
      <RecentTransactions />
    </main>
  );
};

Dashboard.displayName = "Dashboard";

export default Dashboard;
