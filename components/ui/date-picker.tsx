"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import useDetailsTabStore from "@/store/details-tab-store";
import { format } from "date-fns";
import { useState } from "react";

export function DatePicker() {
  const [date, setDate] = useDetailsTabStore((state) => [
    state.createdAt,
    state.setCreatedAt,
  ]);
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
      <PopoverContent className="z-[102] w-auto p-0" align="start">
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
      </PopoverContent>
    </Popover>
  );
}
