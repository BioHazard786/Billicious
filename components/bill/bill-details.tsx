import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { deleteBill, fetchBillDetails } from "@/server/fetchHelpers";
import useBillDeatilsState from "@/store/bill-details-state-store";
import useDashboardStore from "@/store/dashboard-store";
import useUserInfoStore from "@/store/user-info-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Banknote, CalendarDays, ReceiptText, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { Dispatch, SetStateAction, useMemo, useState } from "react";
import { toast } from "sonner";
import { getCategoryIcon } from "../dashboard/recent-transactions";
import AnimatedButton from "../ui/animated-button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import NoContent from "../ui/no-content";
import ResponsiveDialog from "../ui/responsive-dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Spinner } from "../ui/spinner";
import { Textarea } from "../ui/textarea";

const BillDetails = ({
  billId,
  billName,
  setSelectedBill,
}: {
  billId?: string;
  billName?: string;
  setSelectedBill: (
    value: SetStateAction<{
      billId: string | undefined;
      billName: string | undefined;
    }>,
  ) => void;
}) => {
  const { slug: groupId } = useParams();
  const queryClient = useQueryClient();
  const user = useUserInfoStore((state) => state.user);
  const isBillDetailsOpen = useBillDeatilsState.use.isOpen();
  const setIsBillDetailsOpen = useBillDeatilsState.use.setIsOpen();
  const members = useDashboardStore((state) => state.members);
  const currencyCode = useDashboardStore((state) => state.currencyCode);
  const removeBillFromGroup = useDashboardStore((state) => state.updateGroup);
  const removeTransaction = useDashboardStore(
    (state) => state.removeTransaction,
  );
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const currencySymbol = useMemo(
    () => CURRENCIES[currencyCode || "INR"].currencySymbol,
    [currencyCode],
  );

  const isMembersOfThisGroup = useMemo(
    () => members.some((member) => member.memberId === user?.id),
    [members, user?.id],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["bill", billId],
    queryFn: () => fetchBillDetails(billId!),
    enabled: !!billId,
  });

  const { isPending, mutateAsync: server_deleteGroup } = useMutation({
    mutationFn: deleteBill,
    onMutate: () => {
      const toastId = toast.loading(`Deleting ${billName} bill...`);
      return { toastId };
    },
    onSuccess: async (data, variables, context) => {
      removeBillFromGroup({
        updatedMemberData: data.members,
        totalAmount: Number(data.totalGroupExpense),
      });
      removeTransaction(billId!, groupId as string);
      queryClient.invalidateQueries({
        queryKey: ["settleUp", groupId as string],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["expenses", groupId as string],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["timelineChart", groupId as string],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["categoryChart", groupId as string],
        exact: true,
      });
      return toast.success(`${billName} deleted successfully`, {
        id: context.toastId,
      });
    },
    onError: (error, variables, context) => {
      console.log(error);
      return toast.error(error.message, {
        id: context?.toastId,
      });
    },
    onSettled: () => {
      setIsAlertDialogOpen(false);
      setIsBillDetailsOpen(false);
      setSelectedBill({ billId: undefined, billName: undefined });
    },
  });

  const handleDeleteGroup = async () => {
    await server_deleteGroup(billId!);
  };

  const footerContent = isMembersOfThisGroup ? (
    <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button
          className="w-full items-center"
          variant="destructive"
          disabled={isPending}
        >
          {isPending ? (
            <Spinner
              className="mr-2 size-4"
              loadingSpanClassName="bg-destructive-foreground"
            />
          ) : (
            <Trash2 className="mr-2 size-4" />
          )}
          Delete Bill
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="z-[200]">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your bill
            and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AnimatedButton
            loadingSpanClassName="bg-destructive-foreground"
            isLoading={isPending}
            variant="destructive"
            onClick={handleDeleteGroup}
          >
            Delete
          </AnimatedButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ) : null;

  return (
    <ResponsiveDialog
      isOpen={isBillDetailsOpen}
      setIsOpen={setIsBillDetailsOpen}
      title="Bill Details"
      description={`View details of the bill ${billName}`}
      footerContent={footerContent}
    >
      <ScrollArea className="h-[40vh] md:h-[300px]">
        {isLoading && (
          <div className="grid h-[40vh] w-full place-items-center md:h-[300px]">
            <Spinner
              loadingSpanClassName="bg-muted-foreground"
              className="size-6 md:size-6 lg:size-7"
            />
          </div>
        )}
        {!data ? (
          <div className="flex h-[40vh] w-full flex-col items-center justify-center gap-4 md:h-[300px]">
            <NoContent className="size-32 md:size-48" />
            <div className="text-sm text-muted-foreground md:text-base">
              No bill here. Click + to add bills
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-4 pt-0 md:p-0 md:pr-4">
            <div>
              <Label htmlFor="billName">Bill Name</Label>
              <Input disabled value={data.bill.name} id="billName" />
            </div>
            <Separator />
            <div className="flex-1">
              <Label htmlFor="createdAt">Created At</Label>
              <div className="relative">
                <Input
                  disabled
                  value={format(data.bill.createdAt, "PPP")}
                  className="peer ps-9"
                  id="createdAt"
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-foreground/50">
                  <CalendarDays size={16} strokeWidth={2} aria-hidden="true" />
                </div>
              </div>
            </div>
            {/* <div className="flex-1">
                <Label htmlFor="updatedAt">Updated At</Label>
                <div className="relative">
                  <Input
                    disabled
                    value={format(data.bill.updatedAt, "PP")}
                    id="updatedAt"
                    className="peer ps-9"
                  />
                  <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-foreground/50">
                    <CalendarClock
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div> */}

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
            {data.bill.notes && (
              <>
                <div className="flex-1">
                  <Label htmlFor="noyed">Notes</Label>
                  <Textarea
                    placeholder="Add Note..."
                    disabled
                    id="notes"
                    className="min-h-[40px]"
                    value={data.bill.notes}
                  />
                </div>
                <Separator />
              </>
            )}
            <Table>
              <TableCaption>
                A list of credits and debits of members.
              </TableCaption>
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
                          <AvatarImage
                            src={member.avatarUrl}
                            alt={member.name}
                          />
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
              {data.bill.category !== "Payment" ? (
                <ReceiptText className="size-6" />
              ) : (
                <Banknote className="size-6" />
              )}{" "}
              Created By{" "}
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
              <span className="font-medium">
                {timeAgo(data.bill.createdAt)}
              </span>
            </div>
          </div>
        )}
      </ScrollArea>
    </ResponsiveDialog>
  );
};

export default BillDetails;
