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
import useDashboardStore from "@/store/dashboard-store";
import { format } from "date-fns";
import { ArrowRight, MoveRight, Tags } from "lucide-react";
import { useMemo } from "react";
import AvatarCircles from "../ui/avatar-circles";
import NoContent from "../ui/no-content";

export default function RecentTransactions() {
  const transactions = useDashboardStore((state) => state.transactions);
  const members = useDashboardStore((state) => state.members);
  const currencyCode = useDashboardStore((state) => state.currencyCode);
  const currencySymbol = useMemo(
    () => CURRENCIES[currencyCode || "INR"].currencySymbol,
    [currencyCode],
  );

  if (transactions.length === 0) {
    return (
      <Card className="flex h-full flex-col md:col-span-2">
        <CardHeader className="px-7">
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            Recent transactions from your group.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex h-full flex-col items-center justify-center gap-4">
          <NoContent className="size-32 md:size-48" />
          <div className="text-sm text-muted-foreground md:text-base">
            No Transactions here. Click + to add one
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full md:col-span-2">
      <CardHeader className="px-7">
        <CardTitle>Transactions</CardTitle>
        <CardDescription>Recent transactions from your group.</CardDescription>
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
              <TableRow key={transaction.id} className="no-hover">
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
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

const getCategoryIcon = (category: string, className?: string) => {
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
