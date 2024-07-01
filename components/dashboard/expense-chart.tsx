import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProgressBar from "@/components/ui/progress-bar";
import { totalPayeeBill as memberBillPaid } from "@/lib/utils";
import useDashboardStore from "@/store/dashboard-store";
import { AnimatePresence } from "framer-motion";
import { ScrollArea } from "../ui/scroll-area";

const ExpenseChart = () => {
  const [members, totalBill] = useDashboardStore((group) => [
    group.members,
    group.totalBill,
  ]);

  return (
    <Card className="h-min md:col-span-2 lg:col-span-1 lg:row-span-2 lg:h-[615px]">
      <ScrollArea className="lg:h-[615px]">
        <CardHeader>
          <CardTitle>Paid Till Now</CardTitle>
          <CardDescription>Total money spent by each user</CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence initial={false}>
            {members.map((member, index) => (
              <ProgressBar
                name={member.name}
                expenses={member.expenses}
                moneySpent={memberBillPaid(member.memberBills)}
                total={totalBill}
                key={`progress-bar-${index}`}
              />
            ))}
          </AnimatePresence>
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default ExpenseChart;
