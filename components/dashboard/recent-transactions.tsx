import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CURRENCIES } from "@/constants/items";
import { categories, cn } from "@/lib/utils";
import useBillDeatilsState from "@/store/bill-details-state-store";
import useDashboardStore from "@/store/dashboard-store";
import { format } from "date-fns";
import { Tags } from "lucide-react";
import { useMemo, useState } from "react";
import BillDetails from "../bill/bill-details";
import AvatarCircles from "../ui/avatar-circles";
import Cash from "../ui/cash";

export default function RecentTransactions() {
  const transactions = useDashboardStore((state) => state.transactions);
  const members = useDashboardStore((state) => state.members);
  const currencyCode = useDashboardStore((state) => state.currencyCode);
  const setIsBillDetailsOpen = useBillDeatilsState.use.setIsOpen();
  const [selectedBill, setSelectedBill] = useState<{
    billId: string | undefined;
    billName: string | undefined;
  }>({ billId: undefined, billName: undefined });
  const currencySymbol = useMemo(
    () => CURRENCIES[currencyCode || "INR"].currencySymbol,
    [currencyCode],
  );

  if (transactions.length === 0) {
    return (
      <Card className="flex h-full flex-col md:col-span-2">
        <CardHeader className="px-7">
          <CardTitle>Expenses</CardTitle>
          <CardDescription>Recent expenses from your group.</CardDescription>
        </CardHeader>

        <CardContent className="flex h-full flex-col items-center justify-center gap-4">
          <Cash className="size-32 md:size-48" />
          <div className="space-y-1 text-center">
            <p className="text-lg font-semibold md:text-xl">No Expenses Yet!</p>
            <p className="text-sm text-muted-foreground md:text-base">
              Your wallet’s still full! Add expenses to start tracking spending.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <BillDetails
        billId={selectedBill.billId}
        billName={selectedBill.billName}
        setSelectedBill={setSelectedBill}
      />
      <Card className="h-full md:col-span-2">
        <CardHeader className="px-7">
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>
            See the latest expenses in your group
          </CardDescription>
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
              {transactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className="no-hover cursor-pointer"
                  onClick={(e) => {
                    setSelectedBill({
                      billId: transaction.id,
                      billName: transaction.name,
                    });
                    setIsBillDetailsOpen(true);
                  }}
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
                    {transaction.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

export const getCategoryIcon = (category: string, className?: string) => {
  const { icon: Icon, color } = categories[category] || {
    icon: Tags,
    color: "cyan",
  };
  return (
    <Icon
      data-accent-color={color}
      className={cn("text-[--accent-fg]", className)}
    />
  );
};
