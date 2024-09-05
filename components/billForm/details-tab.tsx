import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { totalPayeeBill } from "@/lib/utils";
import useContributionsTabStore from "@/store/contributions-tab-store";
import useDashboardStore from "@/store/dashboard-store";
import useDetailsTabStore from "@/store/details-tab-store";
import useSplitTabStore from "@/store/split-tab-store";
import {
  Bed,
  Bus,
  CalendarDays,
  GlassWater,
  MessageSquare,
  Pizza,
  ShoppingCart,
  Tags,
  Ticket,
  Tv,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { useMemo } from "react";

const DetailsTab = () => {
  const payees = useContributionsTabStore((state) => state.payees);
  const totalBill = useMemo(() => totalPayeeBill(payees), [payees]);
  const { billName, setBillName, notes, setNotes } = useDetailsTabStore(
    (state) => state,
  );

  return (
    <>
      <DialogHeader className="hidden pb-4 md:block">
        <DialogTitle>Details</DialogTitle>
        <DialogDescription>Total: ₹{totalBill.toFixed(2)}</DialogDescription>
      </DialogHeader>
      <DrawerHeader className="pb-4 md:hidden">
        <DrawerTitle>Details</DrawerTitle>
        <DrawerDescription>Total: ₹{totalBill.toFixed(2)}</DrawerDescription>
      </DrawerHeader>
      <ScrollArea className="h-[300px]">
        <div className="flex flex-col gap-5 p-4 md:px-0 md:pr-4">
          <div className="flex gap-2">
            <Popover modal>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="px-2">
                  <Tags />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="z-[101] w-64">
                <CategoryPopover />
              </PopoverContent>
            </Popover>
            <Input
              placeholder="Bill Name"
              value={billName}
              onChange={(e) => setBillName(e.target.value)}
            />
          </div>
          <Separator />
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <CalendarDays className="size-5" />
              <DatePicker />
            </div>
            <div className="flex items-center gap-4">
              <MessageSquare className="size-5" />
              <Textarea
                placeholder="Add Note..."
                className="min-h-[40px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <Separator />
          <DetailsTable payees={payees} totalBill={totalBill} />
        </div>
      </ScrollArea>
    </>
  );
};

const DetailsTable = ({
  payees,
  totalBill,
}: {
  payees: { [key: string]: number };
  totalBill: number;
}) => {
  const members = useDashboardStore((group) => group.members);
  const drawees = useSplitTabStore((state) => state.drawees);
  const billPerEachDrawee = totalBill / drawees.length;
  return (
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
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
                {member.name}
              </span>
            </TableCell>
            <TableCell className="text-right text-primary">
              {payees.hasOwnProperty(member.memberIndex)
                ? `₹${payees[member.memberIndex].toFixed(2)}`
                : "-"}
            </TableCell>
            <TableCell className="text-right text-destructive">
              {drawees.some((draweeIndex) => draweeIndex === member.memberIndex)
                ? `-₹${billPerEachDrawee.toFixed(2)}`
                : "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const CategoryPopover = () => (
  <div className="grid grid-cols-3 gap-2">
    <div className="flex cursor-pointer flex-col items-center rounded-md p-1 hover:bg-muted">
      <Bus className="size-5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Transport</span>
    </div>
    <div className="rounded- flex cursor-pointer flex-col items-center rounded-md p-1 hover:bg-muted">
      <Bed className="size-5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Lodging</span>
    </div>
    <div className="flex cursor-pointer flex-col items-center rounded-md p-1 hover:bg-muted">
      <ShoppingCart className="size-5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Shopping</span>
    </div>
    <div className="flex cursor-pointer flex-col items-center rounded-md p-1 hover:bg-muted">
      <Tv className="size-5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Entertain</span>
    </div>
    <div className="flex cursor-pointer flex-col items-center rounded-md p-1 hover:bg-muted">
      <UtensilsCrossed className="size-5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Food</span>
    </div>
    <div className="flex cursor-pointer flex-col items-center rounded-md p-1 hover:bg-muted">
      <GlassWater className="size-5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Drinks</span>
    </div>
    <div className="flex cursor-pointer flex-col items-center rounded-md p-1 hover:bg-muted">
      <Pizza className="size-5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Snacks</span>
    </div>
    <div className="flex cursor-pointer flex-col items-center rounded-md p-1 hover:bg-muted">
      <Ticket className="size-5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Tickets</span>
    </div>
    <div className="flex cursor-pointer flex-col items-center rounded-md p-1 hover:bg-muted">
      <Wallet className="size-5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Others</span>
    </div>
  </div>
);
export default DetailsTab;
