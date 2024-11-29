"use client";

import { CURRENCIES } from "@/constants/items";
import { formatTransactionData } from "@/lib/utils";
import { fetchTransactions } from "@/server/fetchHelpers";
import useDashboardStore from "@/store/dashboard-store";
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
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
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
    queryKey: ["expenses", groupId as string],
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

  if (status === "error") {
    return (
      <div className="flex h-screen w-full items-center justify-center [@supports(height:100dvh)]:h-dvh">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <Card className="order-3 row-span-2 lg:order-2">
      <ScrollArea className="lg:h-full">
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
          <CardDescription>All expenses from your group</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "pending" && (
            <div className="flex h-screen w-full items-center justify-center [@supports(height:100dvh)]:h-dvh">
              <Spinner
                loadingSpanClassName="bg-muted-foreground"
                className="size-6 md:size-6 lg:size-7"
              />
            </div>
          )}
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
              {data?.pages[0].length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4">
                  <NoContent className="size-32 md:size-48" />
                  <div className="text-sm text-muted-foreground md:text-base">
                    No debts here. Click + to add transactions
                  </div>
                </div>
              ) : (
                data?.pages.map((transactions, index) => (
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
                ))
              )}
            </TableBody>
          </Table>
          {isFetchingNextPage && (
            <span className="flex items-center justify-center p-2">
              <Spinner
                loadingSpanClassName="bg-muted-foreground"
                className="size-6 md:size-6 lg:size-7"
              />
            </span>
          )}
        </CardContent>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Card>
  );
};

export default Expenses;