import { useAppleDevice } from "@/hooks/use-apple-device";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import React, { useMemo, useState } from "react";
import { CircleFlag } from "react-circle-flags";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

import { CURRENCIES } from "@/constants/items";
import useGroupNameTabStore from "@/store/group-name-tab-store";
import { InputWithLimit } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import ResponsiveHeader from "../ui/responsive-header";

const GroupNameTab: React.FC = () => {
  const { isAppleDevice } = useAppleDevice();

  const groupName = useGroupNameTabStore.use.groupName();
  const setGroupName = useGroupNameTabStore.use.setGroupName();
  const selectedCurrency = useGroupNameTabStore.use.currency();
  const setCurrency = useGroupNameTabStore.use.setCurrency();

  const [open, setOpen] = useState(false);

  const currencyList = useMemo(() => Object.entries(CURRENCIES), []);

  const handleCurrencySelect = (currentValue: string) => {
    const currentCurrencyCode = currentValue.split(" | ")[0];
    setCurrency(
      currentCurrencyCode === selectedCurrency ? "" : currentCurrencyCode,
    );
    setOpen(false);
  };

  return (
    <>
      <ResponsiveHeader
        isDesktop={true}
        title="Create Group"
        description="Choose group name annd currency"
      />
      <ResponsiveHeader
        isDesktop={false}
        title="Create Group"
        description="Choose group name annd currency"
      />
      <div className="space-y-8 px-4 py-6 lg:px-2">
        <div className="space-y-2">
          <Label>Group's name</Label>
          <InputWithLimit
            maxLength={32}
            characterCount={groupName.length}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className={isAppleDevice ? "text-base" : ""}
            autoComplete="groupName"
            id="groupName"
            placeholder="Trip to India"
          />
        </div>
        <div className="space-y-2">
          <Label>Currency</Label>
          <Popover open={open} onOpenChange={setOpen} modal>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="h-10 w-full justify-between font-normal"
              >
                {selectedCurrency ? (
                  <span className="flex items-center gap-2">
                    <CircleFlag
                      countryCode={CURRENCIES[selectedCurrency].countryCode}
                      className="size-5"
                    />
                    <span>
                      {selectedCurrency} -{" "}
                      {CURRENCIES[selectedCurrency].currencyName} (
                      {CURRENCIES[selectedCurrency].currencySymbol})
                    </span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Select currency...
                  </span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="z-[102] w-[--radix-popper-anchor-width] p-0">
              <Command>
                <CommandInput
                  placeholder="Search currency..."
                  className="h-10"
                  containerClassName="hidden md:flex"
                />
                <CommandList>
                  <CommandEmpty>No currency found.</CommandEmpty>
                  <CommandGroup className="overflow-y-auto">
                    {currencyList.map(
                      ([
                        currencyCode,
                        { currencyName, currencySymbol, countryCode },
                      ]) => (
                        <CommandItem
                          key={`currency-${currencyCode}`}
                          value={`${currencyCode} | ${currencyName}`}
                          onSelect={handleCurrencySelect}
                        >
                          <CircleFlag
                            countryCode={countryCode}
                            className="mr-2 size-8"
                          />
                          <div className="flex flex-col">
                            <span>{`${currencyCode} (${currencySymbol})`}</span>
                            <span className="text-xs text-muted-foreground">
                              {currencyName}
                            </span>
                          </div>
                          <CheckIcon
                            className={cn(
                              "ml-auto size-4",
                              currencyCode === selectedCurrency
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      ),
                    )}
                  </CommandGroup>
                </CommandList>
                <CommandInput
                  placeholder="Search currency..."
                  className="h-10"
                  containerClassName="md:hidden border-b-0 border-t"
                />
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </>
  );
};

export default GroupNameTab;
