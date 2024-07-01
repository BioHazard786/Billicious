import { IndianRupee } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useDashboardStore from "@/store/dashboard-store";
import AnimatedCounter from "../ui/animated-counter";

export default function TotalExpense() {
  const totalBill = useDashboardStore((group) => group.totalBill);

  return (
    <Card className="h-min">
      <CardHeader>
        <div className="flex items-center justify-between space-y-0">
          <CardTitle>Total Expense</CardTitle>
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Total money spent till now</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-[0.625rem] flex text-3xl font-bold">
          <span className="mr-1">₹</span>
          <AnimatedCounter value={totalBill} precision={2} />
        </div>
      </CardContent>
    </Card>
  );
}
