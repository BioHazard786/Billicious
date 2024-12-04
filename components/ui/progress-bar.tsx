import { cn } from "@/lib/utils";
import { animate, motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Progress } from "./progress";

interface ProgressBarProps {
  name: string;
  avatarUrl?: string;
  totalPaid: number;
  totalBill: number;
  balance: number;
  currencySymbol: string;
  status: number;
}

const ProgressBar = ({
  name,
  avatarUrl,
  totalPaid,
  totalBill,
  balance,
  currencySymbol,
  status,
}: ProgressBarProps) => {
  const width = useMemo(
    () => (totalBill === 0 ? 0 : totalPaid / totalBill),
    [totalPaid, totalBill],
  );
  const previousBill = useRef(totalPaid);
  const previousBalance = useRef(balance);
  const totalPaidRef = useRef<HTMLSpanElement>(null);
  const balanceRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = totalPaidRef.current;
    if (!node) return;

    const controls = animate(previousBill.current, totalPaid, {
      duration: 0.5,
      onUpdate: (value) => {
        node.textContent = value.toFixed(2);
      },
    });
    previousBill.current = totalPaid;
    return () => controls.stop();
  }, [totalPaid]);

  useEffect(() => {
    const node = balanceRef.current;
    if (!node) return;

    const controls = animate(previousBalance.current, balance, {
      duration: 0.5,
      onUpdate: (value) => {
        node.textContent =
          value < 0
            ? `-${currencySymbol}${(-value).toFixed(2)}`
            : `${currencySymbol}${value.toFixed(2)}`;
      },
    });
    previousBalance.current = balance;
    return () => controls.stop();
  }, [balance]);

  const balanceText =
    balance < 0
      ? `-${currencySymbol}${(-balance).toFixed(2)}`
      : `${currencySymbol}${balance.toFixed(2)}`;

  return (
    <motion.div
      className="flex flex-grow flex-row py-4"
      initial={{ opacity: 0, translateY: -50 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -50 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      <Avatar className="relative">
        <AvatarImage src={avatarUrl} alt={name} />
        {status === 1 && avatarUrl && (
          <div
            className={cn(
              "absolute inset-0 rounded-full",
              "bg-black/50",
              "pointer-events-none",
            )}
          />
        )}
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>
      <div className="ml-4 flex flex-grow flex-col">
        <div className="mb-1 flex flex-row justify-between">
          <p className="text-sm">
            <span className="max-w-14 truncate md:max-w-32 lg:w-full">
              {name}
            </span>
            {balance !== 0 && (
              <span
                className={`font-mono ${balance >= 0 ? "text-primary" : "text-destructive"}`}
              >
                <span className="ml-1">(</span>
                <span ref={balanceRef}>{balanceText}</span>
                <span>)</span>
              </span>
            )}
          </p>
          <p className="font-mono text-sm">
            <span className="mr-[0.1rem]">{currencySymbol}</span>
            <span ref={totalPaidRef}>{totalPaid.toFixed(2)}</span>
          </p>
        </div>
        <Progress
          value={width * 100}
          className="h-[0.65rem] rounded-lg rounded-l-sm"
          progressBar="bg-gradient-to-r from-[#22d3ee] to-primary rounded-lg rounded-l-sm"
        />
        {/* <div className="flex h-[0.65rem] flex-col rounded-lg rounded-l-sm bg-muted">
          <motion.div
            animate={{
              opacity: 1,
              width: `${width * 100}%`,
              transition: { duration: 0.3, ease: "easeInOut" },
            }}
            initial={{ opacity: 0, width: 0 }}
            className="flex h-full items-center justify-center rounded-lg rounded-l-sm bg-gradient-to-r from-[#22d3ee] to-primary"
          />
        </div> */}
      </div>
    </motion.div>
  );
};

export default ProgressBar;
