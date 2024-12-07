"use client";
import { createClient } from "@/auth-utils/client";
import { viewGroup } from "@/server/fetchHelpers";
import useBillDeatilsState from "@/store/bill-details-state-store";
import useDashboardStore from "@/store/dashboard-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { set } from "date-fns";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo } from "react";

const Realtime = () => {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const { slug: groupId } = useParams();
  const addBillToGroup = useDashboardStore((state) => state.updateGroup);
  const addTransaction = useDashboardStore((state) => state.addTransaction);
  const setIsBillDetailsOpen = useBillDeatilsState.use.setIsOpen();
  const removeTransaction = useDashboardStore(
    (state) => state.removeTransaction,
  );

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

  const refetchQueries = () => {
    queryClient.refetchQueries({
      queryKey: ["settleUp", groupId as string],
      exact: true,
    });
    queryClient.refetchQueries({
      queryKey: ["expenses", groupId as string],
      exact: true,
    });
    queryClient.refetchQueries({
      queryKey: ["timelineChart", groupId as string],
      exact: true,
    });
    queryClient.refetchQueries({
      queryKey: ["categoryChart", groupId as string],
      exact: true,
    });
  };

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
          refetchQueries();
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
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bills_table",
        },
        async (payload) => {
          refetchQueries();
          setIsBillDetailsOpen(false);
          await server_fetchNewGroupData(groupId as string);
          removeTransaction(payload.old.id, groupId as string);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  return <></>;
};

export default Realtime;
