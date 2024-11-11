import { cn } from "@/lib/utils";
import { easeOut, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function formatForDisplay(number: number, precision: number) {
  return Math.max(number, 0).toFixed(precision).split("").reverse();
}

function DecimalColumn() {
  return (
    <div>
      <span>.</span>
    </div>
  );
}

function NumberColumn({ digit }: { digit: string }) {
  const [position, setPosition] = useState(0);
  const columnContainer = useRef<HTMLDivElement>(null);

  const setColumnToNumber = (number: string) => {
    setPosition(columnContainer.current!.clientHeight * parseInt(number, 10));
  };

  useEffect(() => setColumnToNumber(digit), [digit]);

  return (
    <div className="relative" ref={columnContainer}>
      <motion.div
        initial={false}
        animate={{ y: position }}
        transition={{ ease: "easeOut", duration: 0.5 }}
        className="absolute bottom-0 h-[1000%]"
      >
        {[9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((num) => (
          <div key={`ticker-column-${num}`} className="h-[10%]">
            <span>{num}</span>
          </div>
        ))}
      </motion.div>
      <span className="invisible">0</span>
    </div>
  );
}

export default function AnimatedCounter({
  value,
  precision = 0,
  className,
}: {
  value: number;
  precision?: number;
  className?: string;
}) {
  const numArray = formatForDisplay(value, precision);

  return (
    <motion.div
      layout
      className={cn(
        "relative flex h-full flex-row-reverse items-center justify-center overflow-hidden",
        className,
      )}
    >
      {numArray.map((number, index) =>
        number === "." ? (
          <DecimalColumn key={`decimal-column-${index}`} />
        ) : (
          <NumberColumn key={`number-column-${index}`} digit={number} />
        ),
      )}
    </motion.div>
  );
}
