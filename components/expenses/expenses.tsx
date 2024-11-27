"use client";

import { CURRENCIES } from "@/constants/items";
import { TransactionT } from "@/lib/types";
import { formatTransactionData } from "@/lib/utils";
import { fetchTransactions } from "@/server/fetchHelpers";
import useDashboardStore from "@/store/dashboard-store";
import useUserInfoStore from "@/store/user-info-store";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import { getCategoryIcon } from "../dashboard/recent-transactions";
import AvatarCircles from "../ui/avatar-circles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import NoContent from "../ui/no-content";
import { Spinner } from "../ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const Expenses = () => {
  const user = useUserInfoStore((state) => state.user);
  const { slug: groupId } = useParams();
  const members = useDashboardStore((state) => state.members);
  const currencyCode = useDashboardStore((state) => state.currencyCode);
  const currencySymbol = useMemo(
    () => CURRENCIES[currencyCode || "INR"].currencySymbol,
    [currencyCode],
  );

  const [lastTransactionRef, entry] = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: "0px 0px 100px 0px",
  });

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["expenses", user?.id, groupId as string],
    queryFn: async ({ pageParam }) => {
      const data = await fetchTransactions(groupId as string, pageParam);
      return formatTransactionData(data);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined;
      }
      return lastPageParam + 1;
    },
    getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
      if (firstPageParam <= 1) {
        return undefined;
      }
      return firstPageParam - 1;
    },
  });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (status === "pending") {
    return (
      <div className="flex h-screen w-full items-center justify-center [@supports(height:100dvh)]:h-dvh">
        <Spinner
          loadingSpanClassName="bg-muted-foreground"
          className="size-6 md:size-7 lg:size-8"
        />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-screen w-full items-center justify-center [@supports(height:100dvh)]:h-dvh">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  if (data?.pages[0].length === 0) {
    return (
      <Card className="m-3 mb-[5.25rem] mt-16 lg:mb-3 lg:ml-[4.2rem]">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>All transactions from your group</CardDescription>
        </CardHeader>

        <CardContent className="flex h-full flex-col items-center justify-center gap-4">
          <NoContent className="size-32 md:size-48" />
          <div className="text-sm text-muted-foreground md:text-base">
            No transactions here. Click + to add
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="m-3 mb-[5.25rem] mt-16 lg:mb-3 lg:ml-[4.2rem]">
      <CardHeader className="px-7">
        <CardTitle>Transactions</CardTitle>
        <CardDescription>All transactions from your group</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Payees</TableHead>
              <TableHead className="hidden sm:table-cell">Drawees</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.pages.map((transactions, index) => (
              <React.Fragment key={`infinite-transactions-${index}`}>
                {transactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="no-hover"
                    ref={
                      index === data?.pages.length - 1
                        ? lastTransactionRef
                        : undefined
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(transaction.category)}
                        <div>
                          <div className="max-w-32 truncate font-medium md:max-w-40 lg:w-full">
                            {transaction.name}
                          </div>
                          <div className="hidden text-muted-foreground md:inline">
                            {format(transaction.createdAt, "EEEE, MMMM d")}
                          </div>
                          <div className="max-w-32 truncate text-sm text-muted-foreground md:hidden">
                            {format(transaction.createdAt, "EEE, MMM d")}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <AvatarCircles
                        className="size-8"
                        limit={4}
                        members={transaction.payees.map(
                          (payeeIndex) => members[payeeIndex],
                        )}
                      />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <AvatarCircles
                        className="size-8"
                        limit={4}
                        members={transaction.drawees.map(
                          (draweeIndex) => members[draweeIndex],
                        )}
                      />
                    </TableCell>
                    <TableCell className="text-right font-mono text-destructive">
                      -{currencySymbol}
                      {transaction.amount}
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
        {isFetchingNextPage && (
          <span className="flex items-center justify-center p-2">
            <Spinner
              loadingSpanClassName="bg-muted-foreground"
              className="size-6 md:size-7 lg:size-8"
            />
          </span>
        )}
      </CardContent>
    </Card>
  );
};

export default Expenses;
