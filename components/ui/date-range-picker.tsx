"use client";

import { format, subDays } from "date-fns";
import { CalendarDays } from "lucide-react";
import * as React from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export function DateRangePicker({
  className,
  date,
  setDate,
  disabled,
}: React.HTMLAttributes<HTMLDivElement> & {
  date: DateRange | undefined;
  setDate: (dateRange: DateRange | undefined) => void;
  disabled?: boolean;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            id="date"
            variant={"outline"}
            className="flex w-full items-center justify-start gap-2 text-sm shadow-none md:w-64"
          >
            <CalendarDays className="size-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date to filter</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="flex w-auto flex-col gap-2 p-2"
          align="start"
        >
          <Select
            onValueChange={(value) =>
              setDate({
                from: subDays(new Date(), Number(value)),
                to: new Date(),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="7">Last week</SelectItem>
              <SelectItem value="30">Last month</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <div className="rounded-md border">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={isDesktop ? 2 : 1}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
