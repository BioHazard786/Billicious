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
import { formatDrawees } from "@/lib/split-tab-utils";
import { categories, cn, isAppleDevice } from "@/lib/utils";
import useContributionsTabStore from "@/store/contributions-tab-store";
import useDashboardStore from "@/store/dashboard-store";
import useDetailsTabStore from "@/store/details-tab-store";
import useSplitByAmountTabStore from "@/store/split-by-amount-tab-store";
import useSplitByPercentTabStore from "@/store/split-by-percent-tab-store";
import useSplitEquallyTabStore from "@/store/split-equally-tab-store";
import useSplitTabStore from "@/store/split-tab-store";
import { CalendarDays, LucideProps, MessageSquare, Tags } from "lucide-react";
import {
  ForwardRefExoticComponent,
  memo,
  RefAttributes,
  useState,
} from "react";

type IconComponent = ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
>;

type CategoryItemProps = {
  Icon: IconComponent;
  label: string;
  onClick: () => void;
};

const DetailsTab = () => {
  const isApple = isAppleDevice();
  const totalBill = useContributionsTabStore.getState().payeesBill;
  const billName = useDetailsTabStore.use.billName();
  const setBillName = useDetailsTabStore.use.setBillName();
  const notes = useDetailsTabStore.use.notes();
  const setNotes = useDetailsTabStore.use.setNotes();

  return (
    <>
      <DialogHeader className="hidden pb-4 md:block">
        <DialogTitle>Details</DialogTitle>
        <DialogDescription className="flex gap-1">
          Total:{" "}
          <span className="flex">
            <span className="mr-[0.1rem]">₹</span>
            <span className="font-mono">{totalBill.toFixed(2)}</span>
          </span>
        </DialogDescription>
      </DialogHeader>
      <DrawerHeader className="pb-4 md:hidden">
        <DrawerTitle>Details</DrawerTitle>
        <DrawerDescription className="flex justify-center gap-1">
          Total:{" "}
          <span className="flex">
            <span className="mr-[0.1rem]">₹</span>
            <span className="font-mono">{totalBill.toFixed(2)}</span>
          </span>
        </DrawerDescription>
      </DrawerHeader>
      <ScrollArea className="h-[40vh] md:h-[300px]">
        <div className="flex flex-col gap-5 p-4 md:px-0 md:pr-4">
          <div className="flex items-center gap-2">
            <CategoryPopover />
            <Input
              className={isApple ? "text-base" : ""}
              placeholder="Bill Name"
              value={billName}
              onChange={(e) => setBillName(e.target.value)}
            />
          </div>
          <Separator />
          <div className="flex flex-col gap-4 pl-2">
            <div className="flex items-center gap-4">
              <CalendarDays className="size-5" />
              <DatePicker />
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
          <DetailsTable />
        </div>
      </ScrollArea>
    </>
  );
};

const DetailsTable = () => {
  const members = useDashboardStore((group) => group.members);
  const payees = useContributionsTabStore.getState().payees;
  const payeesBill = useContributionsTabStore.getState().payeesBill;
  const currentSelectedTab = useSplitTabStore.getState().currentSelectedTab;
  const draweesSplitEqually = useSplitEquallyTabStore.getState().drawees;
  const draweesSplitByAmount =
    useSplitByAmountTabStore.getState().draweesSplitByAmount;
  const draweesSplitByPercent =
    useSplitByPercentTabStore.getState().draweesSplitByPercent;

  const drawees = formatDrawees(
    draweesSplitEqually,
    draweesSplitByAmount,
    draweesSplitByPercent,
    payeesBill,
    currentSelectedTab,
  );

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
            <TableCell className="text-right font-mono text-primary">
              {payees.hasOwnProperty(member.memberIndex)
                ? `₹${payees[member.memberIndex].toFixed(2)}`
                : "-"}
            </TableCell>
            <TableCell className="text-right font-mono text-destructive">
              {drawees.hasOwnProperty(member.memberIndex)
                ? `-₹${drawees[member.memberIndex].toFixed(2)}`
                : "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const CategoryItem = memo(({ Icon, label, onClick }: CategoryItemProps) => (
  <div
    className="flex cursor-pointer flex-col items-center rounded-md p-1 hover:bg-muted"
    onClick={onClick}
  >
    <Icon className="size-5 text-muted-foreground" />
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
));

const CategoryPopover = () => {
  const category = useDetailsTabStore.use.category();
  const setCategory = useDetailsTabStore.getState().setCategory;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover modal open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="link" size="icon" className="px-2">
          {getCategoryIcon(category)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[101] w-64">
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(categories).map(([label, { icon: Icon, color }]) => (
            <CategoryItem
              key={label}
              Icon={Icon}
              label={label}
              onClick={() => {
                setCategory(label);
                setIsOpen(false);
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const getCategoryIcon = (category: string, className?: string) => {
  const { icon: Icon, color } = categories[category] || {
    icon: Tags,
    color: "hsl(var(--primary))",
  };
  return <Icon className={className} style={{ color }} />;
};

export default DetailsTab;
