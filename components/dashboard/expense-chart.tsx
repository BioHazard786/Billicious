import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProgressBar from "@/components/ui/progress-bar";
import { CURRENCIES } from "@/constants/items";
import useDashboardStore from "@/store/dashboard-store";
import { AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { ScrollArea } from "../ui/scroll-area";

const ExpenseChart = () => {
  const members = useDashboardStore((group) => group.members);
  const totalBill = useMemo(
    () => members.reduce((acc, member) => acc + member.totalPaid, 0),
    [members],
  );
  const currencyCode = useDashboardStore((group) => group.currencyCode);

  const currencySymbol = useMemo(
    () => CURRENCIES[currencyCode || "INR"].currencySymbol,
    [currencyCode],
  );

  return (
    <Card className="h-min md:col-span-2 lg:col-span-1 lg:row-span-2 lg:h-full">
      <ScrollArea className="lg:h-full">
        <CardHeader>
          <CardTitle>User Spend Overview</CardTitle>
          <CardDescription>
            Track the total amount spent by each user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence initial={false}>
            {members.map((member, index) => (
              <ProgressBar
                name={member.name}
                avatarUrl={member.avatarUrl}
                balance={member.balance}
                totalPaid={member.totalPaid}
                totalBill={totalBill}
                key={`progress-bar-${index}`}
                currencySymbol={currencySymbol}
                status={member.status}
              />
            ))}
          </AnimatePresence>
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default ExpenseChart;
