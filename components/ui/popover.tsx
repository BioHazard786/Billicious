"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";

import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      onWheel={(e) => {
        e.stopPropagation();

        const isScrollingDown = e.deltaY > 0;

        if (isScrollingDown) {
          // Simulate arrow down key press
          e.currentTarget.dispatchEvent(
            new KeyboardEvent("keydown", { key: "ArrowDown" }),
          );
        } else {
          // Simulate arrow up key press
          e.currentTarget.dispatchEvent(
            new KeyboardEvent("keydown", { key: "ArrowUp" }),
          );
        }
      }}
      onTouchMove={(e) => {
        e.stopPropagation();
        const touch = e.touches[0];
        const currentTouch = touch.clientY;

        // Store the last touch position in a data attribute
        const lastTouch = parseFloat(
          e.currentTarget.getAttribute("data-last-touch") ||
            String(currentTouch),
        );

        // Update the last touch position
        e.currentTarget.setAttribute("data-last-touch", String(currentTouch));

        // Determine scroll direction
        const isScrollingDown = currentTouch > lastTouch;

        // Simulate keyboard events based on touch movement
        if (isScrollingDown) {
          e.currentTarget.dispatchEvent(
            new KeyboardEvent("keydown", { key: "ArrowDown" }),
          );
        } else {
          e.currentTarget.dispatchEvent(
            new KeyboardEvent("keydown", { key: "ArrowUp" }),
          );
        }
      }}
      onTouchStart={(e) => {
        // Store initial touch position
        const touch = e.touches[0];
        e.currentTarget.setAttribute("data-last-touch", String(touch.clientY));
      }}
      {...props}
    />
  </PopoverPrimitive.Portal>
));

PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverContent, PopoverTrigger };
