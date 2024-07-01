import { animate, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "./avatar";

const ProgressBar = ({
  name,
  moneySpent,
  total,
  expenses,
}: {
  name: string;
  moneySpent: number;
  total: number;
  expenses: number;
}) => {
  const width = total === 0 ? 0 : Number(moneySpent / total);
  const previousBill = useRef<number>(moneySpent);
  const previousExpense = useRef<number>(expenses);
  const moneySpendRef = useRef<HTMLSpanElement | null>(null);
  const expensesRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const node = moneySpendRef.current;
    const controls = animate(previousBill.current, moneySpent, {
      duration: 0.5,
      onUpdate(value) {
        if (node) {
          node.textContent = value.toFixed(0);
        }
      },
    });
    previousBill.current = moneySpent;
    return () => controls.stop();
  }, [moneySpent]);

  useEffect(() => {
    const node = expensesRef.current;
    const controls = animate(previousExpense.current, expenses, {
      duration: 0.5,
      onUpdate(value) {
        if (node) {
          node.textContent = value.toFixed(2);
        }
      },
    });
    previousExpense.current = expenses;
    return () => controls.stop();
  }, [expenses]);

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
            {expenses !== 0 ? (
              <span
                className={expenses >= 0 ? "text-primary" : "text-destructive"}
              >
                <span className="ml-1">(</span>
                <span ref={expensesRef}>
                  {expenses < 0
                    ? `-₹${(-expenses).toFixed(2)}`
                    : `₹${expenses.toFixed(2)}`}
                </span>
                <span>)</span>
              </span>
            ) : null}
          </p>
          <p className="text-sm">
            ₹<span ref={moneySpendRef}>{moneySpent}</span>
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
