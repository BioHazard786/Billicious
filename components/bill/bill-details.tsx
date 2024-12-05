import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CURRENCIES } from "@/constants/items";
import { timeAgo } from "@/lib/utils";
import { fetchBillDetails } from "@/server/fetchHelpers";
import useDashboardStore from "@/store/dashboard-store";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarClock, CalendarPlus, ReceiptText } from "lucide-react";
import React, { useMemo } from "react";
import { getCategoryIcon } from "../dashboard/recent-transactions";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import NoContent from "../ui/no-content";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Spinner } from "../ui/spinner";

const BillDetails = ({ billId }: { billId?: string }) => {
  const members = useDashboardStore((state) => state.members);
  const currencyCode = useDashboardStore((state) => state.currencyCode);
  const currencySymbol = useMemo(
    () => CURRENCIES[currencyCode || "INR"].currencySymbol,
    [currencyCode],
  );

  if (!billId) {
    return (
      <div className="flex h-[40vh] flex-col items-center justify-center gap-4 p-4 pt-0 md:h-[300px] md:p-0">
        <NoContent className="size-32 md:size-48" />
        <div className="text-sm text-muted-foreground md:text-base">
          No bill here. Click + to add transactions
        </div>
      </div>
    );
  }

  const { data, isLoading } = useQuery({
    queryKey: ["bill", billId],
    queryFn: () => fetchBillDetails(billId),
  });

  if (isLoading) {
    return (
      <div className="grid h-[40vh] w-full place-items-center md:h-[300px]">
        <Spinner
          loadingSpanClassName="bg-muted-foreground"
          className="size-6 md:size-6 lg:size-7"
        />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[40vh] md:h-[300px]">
      <div className="space-y-4 p-4 pt-0 md:p-0 md:pr-4">
        <div>
          <Label htmlFor="billName">Bill Name</Label>
          <Input disabled value={data.bill.name} id="billName" />
        </div>
        <Separator />
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="createdAt">Created At</Label>
            <div className="relative">
              <Input
                disabled
                value={format(data.bill.createdAt, "PP")}
                className="peer ps-9"
                id="createdAt"
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-foreground/50">
                <CalendarPlus size={16} strokeWidth={2} aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="flex-1">
            <Label htmlFor="updatedAt">Updated At</Label>
            <div className="relative">
              <Input
                disabled
                value={format(data.bill.updatedAt, "PP")}
                id="updatedAt"
                className="peer ps-9"
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-foreground/50">
                <CalendarClock size={16} strokeWidth={2} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="amount">Total Amount</Label>
            <div className="relative">
              <Input
                disabled
                value={Number(data.bill.amount).toFixed(2)}
                className="peer"
                style={{
                  paddingInlineStart: `calc(${currencySymbol.length}ch + 1.9ch)`,
                }}
                id="amount"
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-foreground/50">
                {currencySymbol}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <Label htmlFor="category">Category</Label>
            <div className="relative">
              <Input
                disabled
                value={data.bill.category}
                id="category"
                className="peer ps-9"
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3">
                {getCategoryIcon(data.bill.category, "size-4")}
              </div>
            </div>
          </div>
        </div>
        <Separator />
        <Table>
          <TableCaption>A list of credits and debits of members.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Members</TableHead>
              <TableHead className="text-right">Credit</TableHead>
              <TableHead className="text-right">Debit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member, index) => (
              <TableRow key={`member-detail-table-list-${index}`}>
                <TableCell>
                  <span className="flex items-center gap-2">
                    <Avatar className="size-8">
                      <AvatarImage src={member.avatarUrl} alt={member.name} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    {member.name}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono text-primary">
                  {`${(() => {
                    const matchedPayee = data.payees.find(
                      (payee: any) =>
                        String(payee.userIndex) === member.memberIndex,
                    );
                    return matchedPayee
                      ? `${currencySymbol}${Number(matchedPayee.amount).toFixed(2)}`
                      : "-";
                  })()}`}
                </TableCell>
                <TableCell className="text-right font-mono text-destructive">
                  {`${(() => {
                    const matchedDrawee = data.drawees.find(
                      (drawee: any) =>
                        String(drawee.userIndex) === member.memberIndex,
                    );
                    return matchedDrawee
                      ? `-${currencySymbol}${Number(matchedDrawee.amount).toFixed(2)}`
                      : "-";
                  })()}`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Separator />
        <div className="flex items-center gap-1.5 text-sm">
          <ReceiptText className="size-6" /> Created By{" "}
          <span className="flex items-center gap-2 font-medium">
            <Avatar className="size-6">
              <AvatarImage
                src={members[data.bill.createdBy].avatarUrl}
                alt={members[data.bill.createdBy].name}
              />
              <AvatarFallback>
                {members[data.bill.createdBy].name[0]}
              </AvatarFallback>
            </Avatar>
            {members[data.bill.createdBy].name}
          </span>
          at
          <span className="font-medium">{timeAgo(data.bill.createdAt)}</span>
        </div>
      </div>
    </ScrollArea>
  );
};

export default BillDetails;
