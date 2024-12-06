import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export interface InputWithLimitProps extends InputProps {
  characterCount: number;
}

const InputWithLimit = React.forwardRef<HTMLInputElement, InputWithLimitProps>(
  ({ characterCount, maxLength, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <Input
          maxLength={maxLength}
          aria-describedby="character-count"
          {...props}
          ref={ref}
        />
        <div
          id="character-count"
          className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-xs tabular-nums text-muted-foreground peer-disabled:opacity-50"
          aria-live="polite"
          role="status"
        >
          {characterCount}/{maxLength}
        </div>
      </div>
    );
  },
);

InputWithLimit.displayName = "InputWithLimit";

export interface InputWithCurrencyProps extends InputProps {
  currencyCode: string;
  currencySymbol: string;
  width?: string;
}

const InputWithCurrency = React.forwardRef<
  HTMLInputElement,
  InputWithCurrencyProps
>(({ currencyCode, currencySymbol, className, width, ...props }, ref) => {
  return (
    <div className={cn("relative w-[50%]", width)}>
      <Input
        {...props}
        className={cn("peer pe-12", className)}
        style={{
          paddingInlineStart: `calc(${currencySymbol.length}ch + 1.5ch)`,
        }}
        ref={ref}
      />
      <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm text-muted-foreground peer-disabled:opacity-50">
        {currencySymbol}
      </span>
      <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm text-muted-foreground peer-disabled:opacity-50">
        {currencyCode}
      </span>
    </div>
  );
});

InputWithCurrency.displayName = "InputWithCurrency";

export { Input, InputWithCurrency, InputWithLimit };
