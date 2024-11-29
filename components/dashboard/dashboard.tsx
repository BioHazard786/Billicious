"use client";

import { createClient } from "@/auth-utils/client";
import { viewGroup } from "@/server/fetchHelpers";
import useDashboardStore from "@/store/dashboard-store";
import useSplitEquallyTabStore from "@/store/split-equally-tab-store";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import EventName from "./event-name";
import ExpenseChart from "./expense-chart";
import RecentTransactions from "./recent-transactions";
import TotalExpense from "./total-expense";

const Dashboard = () => {
  const supabase = useMemo(() => createClient(), []);
  const { slug: groupId } = useParams();
  const members = useDashboardStore((state) => state.members);
  const addBillToGroup = useDashboardStore((state) => state.addBill);
  const addTransaction = useDashboardStore((state) => state.addTransaction);
  const setInitialDraweeState = useSplitEquallyTabStore.getState().reset;

  const { mutateAsync: server_fetchNewGroupData } = useMutation({
    mutationFn: viewGroup,
    onSuccess: (data) => {
      addBillToGroup({
        updatedMemberData: data.members,
        totalAmount: Number(data.group.totalExpense),
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });

  useEffect(() => {
    setInitialDraweeState(members);
  }, [members, setInitialDraweeState]);

  useEffect(() => {
    const channel = supabase
      .channel("realtime bills")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bills_table",
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          await server_fetchNewGroupData(groupId as string);
          addTransaction({
            name: payload.new.name,
            category: payload.new.category,
            createdAt: new Date(payload.new.created_at + "Z"),
            notes: payload.new.notes,
            id: payload.new.id,
            amount: payload.new.amount,
            isPayment: payload.new.is_payment,
            drawees: payload.new.drawees_string.split("|").map(Number),
            payees: payload.new.payees_string.split("|").map(Number),
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="relative grid h-full w-full grid-cols-1 gap-3 overflow-x-hidden p-3 pb-[5.25rem] pt-16 md:grid-cols-2 lg:h-dvh lg:grid-cols-3 lg:grid-rows-[auto_1fr] lg:pb-3 lg:pl-[4.2rem]">
      <EventName />
      <TotalExpense />
      <ExpenseChart />
      <RecentTransactions />
    </main>
  );
};

Dashboard.displayName = "Dashboard";

export default Dashboard;
