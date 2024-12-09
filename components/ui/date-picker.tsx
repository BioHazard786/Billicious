"use client";

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
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import { useState } from "react";

export function DatePicker({
  date,
  setDate,
}: {
  date: Date;
  setDate: (date: Date) => void;
}) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  return (
    <Popover modal open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-min justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[102] flex w-auto flex-col gap-2 p-2"
        align="start"
      >
        <Select
          onValueChange={(value) => setDate(subDays(new Date(), Number(value)))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent position="popper" className="z-[200]">
            <SelectItem value="0">Today</SelectItem>
            <SelectItem value="1">Yesterday</SelectItem>
            <SelectItem value="3">3 days ago</SelectItem>
            <SelectItem value="7">Last week</SelectItem>
          </SelectContent>
        </Select>
        <div className="rounded-md border">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(e) => {
              setDate(e ?? new Date());
              setIsCalendarOpen(false);
            }}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
            initialFocus
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
