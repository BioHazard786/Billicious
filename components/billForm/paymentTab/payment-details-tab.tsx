import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DatePicker } from "@/components/ui/date-picker";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { InputWithLimit } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CURRENCIES } from "@/constants/items";
import { useAppleDevice } from "@/hooks/use-apple-device";
import { cn } from "@/lib/utils";
import useChocieTabStore from "@/store/choice-tab-store";
import useDashboardStore from "@/store/dashboard-store";
import usePaymentDetailsTabStore from "@/store/payment-details-tab-store";
import {
  Banknote,
  CalendarDays,
  ChevronsRight,
  MessageSquare,
} from "lucide-react";
import { useMemo } from "react";

const PaymentDetailsTab = () => {
  const isApple = useAppleDevice().isAppleDevice;
  const amountToBePaid = useChocieTabStore.use.amountToBePaid();
  const currencyCode = useDashboardStore((state) => state.currencyCode);
  const members = useDashboardStore((group) => group.members);
  const notes = usePaymentDetailsTabStore.use.notes();
  const setNotes = usePaymentDetailsTabStore.use.setNotes();
  const description = usePaymentDetailsTabStore.use.description();
  const setDescription = usePaymentDetailsTabStore.use.setDescription();
  const payee = useChocieTabStore.use.selectedPayee();
  const drawee = useChocieTabStore.use.selectedDrawee();
  const [date, setDate] = usePaymentDetailsTabStore((state) => [
    state.createdAt,
    state.setCreatedAt,
  ]);
  const currencySymbol = useMemo(
    () => CURRENCIES[currencyCode || "INR"].currencySymbol,
    [currencyCode],
  );

  return (
    <>
      <DialogHeader className="hidden pb-4 md:block">
        <DialogTitle>Details</DialogTitle>
        <DialogDescription className="flex gap-1">
          Total:{" "}
          <span className="flex">
            <span className="mr-[0.1rem]">{currencySymbol}</span>
            <span className="font-mono">{amountToBePaid.toFixed(2)}</span>
          </span>
        </DialogDescription>
      </DialogHeader>
      <DrawerHeader className="justify-center pb-4 md:hidden">
        <DrawerTitle className="text-center">Details</DrawerTitle>
        <DrawerDescription className="flex justify-center gap-1">
          Total:{" "}
          <span className="flex">
            <span className="mr-[0.1rem]">{currencySymbol}</span>
            <span className="font-mono">{amountToBePaid.toFixed(2)}</span>
          </span>
        </DrawerDescription>
      </DrawerHeader>
      <ScrollArea className="h-[40vh] md:h-[300px]">
        <div className="flex flex-col gap-5 p-4 md:px-0 md:pr-4">
          <div className="flex items-center gap-4 pl-2">
            <Banknote
              data-accent-color="jade"
              className="size-5 text-[--accent-fg]"
            />
            <InputWithLimit
              maxLength={32}
              characterCount={description.length}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={isApple ? "text-base" : ""}
              autoComplete="description"
              id="description"
              placeholder="Description"
            />
          </div>
          <Separator />
          <div className="flex flex-col gap-4 pl-2">
            <div className="flex items-center gap-4">
              <CalendarDays className="size-5" />
              <DatePicker date={date} setDate={setDate} />
            </div>
            <div className="flex items-center gap-4">
              <MessageSquare className="size-5" />
              <Textarea
                placeholder="Add Note..."
                className={cn("min-h-[40px]", isApple ? "text-base" : "")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <Separator />
          <div className="flex flex-wrap items-center gap-2 px-2 text-sm">
            <span className="flex items-center gap-2 text-nowrap">
              <Avatar className="relative">
                <AvatarImage
                  src={members[Number(payee)].avatarUrl}
                  alt={members[Number(payee)].name}
                />
                {members[Number(payee)].status === 1 &&
                  members[Number(payee)].avatarUrl && (
                    <div
                      className={cn(
                        "absolute inset-0 rounded-full",
                        "bg-black/50",
                        "pointer-events-none",
                      )}
                    />
                  )}
                <AvatarFallback>
                  {members[Number(payee)].name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate">{members[Number(payee)].name}</span>
                {members[Number(payee)].username && (
                  <span className="text-xs font-normal text-muted-foreground">
                    @{members[Number(payee)].username}
                  </span>
                )}
              </div>
            </span>
            <span className="font-mono font-medium text-destructive">
              {currencySymbol}
              {amountToBePaid.toFixed(2)}
            </span>
            <ChevronsRight className="size-5" />
            <span className="flex items-center gap-2 text-nowrap">
              <Avatar className="relative">
                <AvatarImage
                  src={members[Number(drawee)].avatarUrl}
                  alt={members[Number(drawee)].name}
                />
                {members[Number(drawee)].status === 1 &&
                  members[Number(drawee)].avatarUrl && (
                    <div
                      className={cn(
                        "absolute inset-0 rounded-full",
                        "bg-black/50",
                        "pointer-events-none",
                      )}
                    />
                  )}
                <AvatarFallback>
                  {members[Number(drawee)].name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate">{members[Number(drawee)].name}</span>
                {members[Number(drawee)].username && (
                  <span className="text-xs font-normal text-muted-foreground">
                    @{members[Number(drawee)].username}
                  </span>
                )}
              </div>
            </span>
          </div>
        </div>
      </ScrollArea>
    </>
  );
};

export default PaymentDetailsTab;
