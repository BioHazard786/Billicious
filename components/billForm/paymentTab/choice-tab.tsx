import AnimatedCounter from "@/components/ui/animated-counter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { InputWithCurrency } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES } from "@/constants/items";
import { useAppleDevice } from "@/hooks/use-apple-device";
import useChocieTabStore from "@/store/choice-tab-store";
import useDashboardStore from "@/store/dashboard-store";
import { ChevronsRight } from "lucide-react";
import { useMemo } from "react";

const ChoiceTab = () => {
  const isApple = useAppleDevice().isAppleDevice;
  const members = useDashboardStore((group) => group.members);
  const currencyCode = useDashboardStore((state) => state.currencyCode);
  const currencySymbol = useMemo(
    () => CURRENCIES[currencyCode || "INR"].currencySymbol,
    [currencyCode],
  );
  const amount = useChocieTabStore.use.amountToBePaid();
  const payee = useChocieTabStore.use.selectedPayee();
  const drawee = useChocieTabStore.use.selectedDrawee();
  const setSelectedPayee = useChocieTabStore.use.setSelectedPayee();
  const setSelectedDrawee = useChocieTabStore.use.setSelectedDrawee();
  const setAmount = useChocieTabStore.use.setAmountToBePaid();

  return (
    <>
      <DialogHeader className="hidden pb-4 md:block">
        <DialogTitle>Payment</DialogTitle>
        <div className="flex gap-1 text-sm text-muted-foreground">
          Total Amount:{" "}
          <span className="flex">
            <span className="mr-[0.1rem]">{currencySymbol}</span>
            <AnimatedCounter
              value={amount}
              precision={2}
              className="font-mono"
            />
          </span>
        </div>
      </DialogHeader>
      <DrawerHeader className="justify-center pb-4 md:hidden">
        <DrawerTitle className="text-center">Payment</DrawerTitle>
        <div className="flex justify-center gap-1 text-sm text-muted-foreground">
          Total Amount:{" "}
          <span className="flex">
            <span className="mr-[0.1rem]">{currencySymbol}</span>
            <AnimatedCounter
              value={amount}
              precision={2}
              className="font-mono"
            />
          </span>
        </div>
      </DrawerHeader>
      <ScrollArea className="h-[40vh] md:h-[300px]">
        <div className="space-y-4 px-4 md:space-y-8 md:px-2">
          <div>
            <Label htmlFor="select-drawee-payee">Choose Drawee and Payee</Label>
            <div
              className="flex flex-col items-center gap-2 rounded-lg border p-3 md:flex-row md:gap-4 md:border-0 md:p-0"
              id="select-drawee-payee"
            >
              <Select onValueChange={setSelectedPayee} value={payee}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select payeee" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectGroup>
                    <SelectLabel>Payees</SelectLabel>
                    {members.map((member, index) => (
                      <SelectItem
                        value={member.memberIndex}
                        key={`select-member-${index}`}
                        disabled={member.memberIndex === drawee}
                      >
                        <div className="flex items-center">
                          <Avatar className="size-7">
                            <AvatarImage
                              src={member.avatarUrl}
                              alt={member.name}
                            />
                            <AvatarFallback className="text-xs">
                              {member.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-2 flex flex-col items-start">
                            <span>{member.name}</span>
                            {member.username && (
                              <span className="text-xs text-muted-foreground">
                                @{member.username}
                              </span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <span className="flex text-destructive" id="amount-summary">
                  <span className="mr-[0.1rem]">{currencySymbol}</span>

                  <AnimatedCounter
                    value={amount}
                    precision={2}
                    className="font-mono"
                  />
                </span>
                <ChevronsRight className="size-5" />
              </div>
              <Select onValueChange={setSelectedDrawee} value={drawee}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select drawee" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectGroup>
                    <SelectLabel>Drawees</SelectLabel>
                    {members.map((member, index) => (
                      <SelectItem
                        value={member.memberIndex}
                        key={`select-member-${index}`}
                        disabled={member.memberIndex === payee}
                      >
                        <div className="flex items-center">
                          <Avatar className="size-7">
                            <AvatarImage
                              src={member.avatarUrl}
                              alt={member.name}
                            />
                            <AvatarFallback className="text-xs">
                              {member.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-2 flex flex-col items-start">
                            <span>{member.name}</span>
                            {member.username && (
                              <span className="text-xs text-muted-foreground">
                                @{member.username}
                              </span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="payee-contribution">Amount to pay</Label>
            <InputWithCurrency
              currencyCode={currencyCode}
              currencySymbol={currencySymbol}
              width="w-full"
              className={isApple ? "w-full text-base" : "w-full"}
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              onKeyDown={(e) => {
                if (
                  e.key === "e" ||
                  e.key === "E" ||
                  e.key === "+" ||
                  e.key === "-"
                ) {
                  e.preventDefault();
                }
              }}
              onWheel={(e) => (e.target as HTMLElement).blur()}
              inputMode="numeric"
              pattern="\d*"
              placeholder="0"
              name="payee-contribution"
              id="payee-contribution"
            />
          </div>
          {/* <div>
            <Label htmlFor="amount-summary">Total Amount</Label>
            <span className="flex text-5xl" id="amount-summary">
              <span className="mr-[0.1rem]">{currencySymbol}</span>

              <AnimatedCounter
                value={amount}
                precision={2}
                className="font-mono"
              />
            </span>
          </div> */}
        </div>
      </ScrollArea>
    </>
  );
};

export default ChoiceTab;
