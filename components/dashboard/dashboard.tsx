"use client";

import { cn } from "@/lib/utils";
import useDashboardStore from "@/store/dashboard-store";
import useSplitEquallyTabStore from "@/store/split-equally-tab-store";
import useUserInfoStore from "@/store/user-info-store";
import { useEffect, useMemo } from "react";
import EventName from "./event-name";
import ExpenseChart from "./expense-chart";
import RecentTransactions from "./recent-transactions";
import TotalExpense from "./total-expense";

const Dashboard = () => {
  const members = useDashboardStore((state) => state.members);
  const setInitialDraweeState = useSplitEquallyTabStore.getState().reset;
  const user = useUserInfoStore((state) => state.user);

  useEffect(() => {
    setInitialDraweeState(members);
  }, [members, setInitialDraweeState]);

  const mainClassName = useMemo(
    () =>
      cn(
        "gap-3 relative grid h-full w-full grid-cols-1 overflow-x-hidden p-3 pt-16 pb-[5.25rem] md:grid-cols-2 md:pb-3 lg:h-dvh lg:grid-cols-3 lg:grid-rows-[auto_1fr] ",
        user ? "lg:pl-[4.2rem]" : "",
      ),
    [user],
  );

  return (
    <main className={mainClassName}>
      <EventName />
      <TotalExpense />
      <ExpenseChart />
      <RecentTransactions />
    </main>
  );
};

export default Dashboard;
