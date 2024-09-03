import { animate, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "./avatar";

const ProgressBar = ({
  name,
  totalPaid,
  totalBill,
  balance,
}: {
  name: string;
  totalPaid: number;
  totalBill: number;
  balance: number;
}) => {
  const width = totalBill === 0 ? 0 : Number(totalPaid / totalBill);
  const previousBill = useRef<number>(totalPaid);
  const previousBalance = useRef<number>(balance);
  const totalPaidRef = useRef<HTMLSpanElement | null>(null);
  const balanceRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const node = totalPaidRef.current;
    const controls = animate(previousBill.current, totalPaid, {
      duration: 0.5,
      onUpdate(value) {
        if (node) {
          node.textContent = value.toFixed(0);
        }
      },
    });
    previousBill.current = totalPaid;
    return () => controls.stop();
  }, [totalPaid]);

  useEffect(() => {
    const node = balanceRef.current;
    const controls = animate(previousBalance.current, balance, {
      duration: 0.5,
      onUpdate(value) {
        if (node) {
          node.textContent =
            value < 0 ? `-₹${(-value).toFixed(2)}` : `₹${value.toFixed(2)}`;
        }
      },
    });
    previousBalance.current = balance;
    return () => controls.stop();
  }, [balance]);

  return (
    <motion.div
      className="flex flex-grow flex-row py-4"
      initial={{ opacity: 0, translateY: -50 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -50 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      <Avatar>
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>
      <div className="ml-4 flex flex-grow flex-col">
        <div className="mb-1 flex flex-row justify-between">
          <p className="text-sm">
            {name}
            {balance !== 0 ? (
              <span
                className={balance >= 0 ? "text-primary" : "text-destructive"}
              >
                <span className="ml-1">(</span>
                <span ref={balanceRef}>
                  {balance < 0
                    ? `-₹${(-balance).toFixed(2)}`
                    : `₹${balance.toFixed(2)}`}
                </span>
                <span>)</span>
              </span>
            ) : null}
          </p>
          <p className="text-sm">
            ₹<span ref={totalPaidRef}>{totalPaid}</span>
          </p>
        </div>
        <div className="flex h-[0.65rem] flex-col rounded-lg rounded-l-sm bg-muted">
          <motion.div
            animate={{
              opacity: 1,
              width: `${width * 100}%`,
              transition: { duration: 0.3, ease: "easeInOut" },
            }}
            initial={{ opacity: 0, width: 0 }}
            className="flex h-[0.65rem] items-center justify-center rounded-lg rounded-l-sm bg-gradient-to-r from-[#22d3ee] to-primary"
          ></motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressBar;
