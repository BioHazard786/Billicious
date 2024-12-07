import { IndianRupee } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CURRENCIES } from "@/constants/items";
import useDashboardStore from "@/store/dashboard-store";
import { useMemo } from "react";
import AnimatedCounter from "../ui/animated-counter";

export default function TotalExpense() {
  const currencyCode = useDashboardStore((group) => group.currencyCode);
  const totalBill = useDashboardStore((group) => group.totalBill);

  const currencySymbol = useMemo(
    () => CURRENCIES[currencyCode || "INR"].currencySymbol,
    [currencyCode],
  );

  return (
    <Card className="h-min">
      <CardHeader>
        <div className="flex items-center justify-between space-y-0">
          <CardTitle>Total Spent</CardTitle>
          <span className="leading-none text-muted-foreground">
            {currencySymbol}
          </span>
        </div>
        <CardDescription>Total money spent so far</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-[0.5rem] flex font-mono text-3xl font-bold">
          <span className="mr-1">{currencySymbol}</span>
          <AnimatedCounter value={totalBill} precision={2} />
        </div>
      </CardContent>
    </Card>
  );
}
