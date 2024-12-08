import { formatDrawees } from "@/components/billForm/splitTab/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { InputWithLimit } from "@/components/ui/input";
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
import { CURRENCIES } from "@/constants/items";
import { useAppleDevice } from "@/hooks/use-apple-device";
import { categories, cn } from "@/lib/utils";
import useContributionsTabStore from "@/store/contributions-tab-store";
import useDashboardStore from "@/store/dashboard-store";
import useDetailsTabStore from "@/store/details-tab-store";
import useSplitByAmountTabStore from "@/store/split-by-amount-tab-store";
import useSplitByPercentTabStore from "@/store/split-by-percent-tab-store";
import useSplitEquallyTabStore from "@/store/split-equally-tab-store";
import useSplitTabStore from "@/store/split-tab-store";
import {
  CalendarDays,
  ChevronDown,
  LucideProps,
  MessageSquare,
  Tags,
} from "lucide-react";
import {
  ForwardRefExoticComponent,
  memo,
  RefAttributes,
  useMemo,
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
  const isApple = useAppleDevice().isAppleDevice;
  const totalBill = useContributionsTabStore.getState().payeesBill;
  const billName = useDetailsTabStore.use.billName();
  const setBillName = useDetailsTabStore.use.setBillName();
  const notes = useDetailsTabStore.use.notes();
  const setNotes = useDetailsTabStore.use.setNotes();
  const currencyCode = useDashboardStore((state) => state.currencyCode);
  const [date, setDate] = useDetailsTabStore((state) => [
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
            <span className="font-mono">{totalBill.toFixed(2)}</span>
          </span>
        </DialogDescription>
      </DialogHeader>
      <DrawerHeader className="justify-center pb-4 md:hidden">
        <DrawerTitle className="text-center">Details</DrawerTitle>
        <DrawerDescription className="flex justify-center gap-1">
          Total:{" "}
          <span className="flex">
            <span className="mr-[0.1rem]">{currencySymbol}</span>
            <span className="font-mono">{totalBill.toFixed(2)}</span>
          </span>
        </DrawerDescription>
      </DrawerHeader>
      <ScrollArea className="h-[40vh] md:h-[300px]">
        <div className="flex flex-col gap-5 p-4 md:px-0 md:pr-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <CategoryPopover />
            </div>
            <InputWithLimit
              maxLength={32}
              characterCount={billName.length}
              value={billName}
              onChange={(e) => setBillName(e.target.value)}
              className={isApple ? "text-base" : ""}
              autoComplete="billName"
              id="billName"
              placeholder="Bill Name"
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
          <DetailsTable currencySymbol={currencySymbol} />
        </div>
      </ScrollArea>
    </>
  );
};

const DetailsTable = ({ currencySymbol }: { currencySymbol: string }) => {
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
                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
                {member.name}
              </span>
            </TableCell>
            <TableCell className="text-right font-mono text-primary">
              {payees.hasOwnProperty(member.memberIndex)
                ? `${currencySymbol}${payees[member.memberIndex].toFixed(2)}`
                : "-"}
            </TableCell>
            <TableCell className="text-right font-mono text-destructive">
              {drawees.hasOwnProperty(member.memberIndex)
                ? `-${currencySymbol}${drawees[member.memberIndex].toFixed(2)}`
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
    className="flex cursor-pointer flex-col items-center rounded-md p-1 transition-colors hover:bg-muted"
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
        <Button variant="link" size="icon" className="w-7 pl-2">
          <div className="flex flex-col items-center">
            {getCategoryIcon(category, "size-5")}
            {category === "Default" && (
              <ChevronDown className="size-4 text-foreground" />
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[101] w-64">
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(categories).map(([label, { icon: Icon }]) =>
            label === "Payment" ? null : (
              <CategoryItem
                key={label}
                Icon={Icon}
                label={label}
                onClick={() => {
                  setCategory(label);
                  setIsOpen(false);
                }}
              />
            ),
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

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

export default DetailsTab;
