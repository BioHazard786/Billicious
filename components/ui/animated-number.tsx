"use client";

import {
  KeyframeOptions,
  animate,
  useInView,
  useIsomorphicLayoutEffect,
} from "framer-motion";
import { useRef } from "react";

type AnimatedNumberProps = {
  value: number;
  precision?: number;
  className?: string;
  animationOptions?: KeyframeOptions;
};

const AnimatedNumber = ({
  value,
  precision = 0,
  className,
  animationOptions,
}: AnimatedNumberProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const previousValue = useRef<number>(value);
  const inView = useInView(ref, { once: true });

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;

    if (!element) return;
    if (!inView) return;

    // If reduced motion is enabled in system's preferences
    if (window.matchMedia("(prefers-reduced-motion)").matches) {
      element.textContent = value.toFixed(precision);
      return;
    }

    const controls = animate(previousValue.current, value, {
      duration: 0.5,
      ease: "easeOut",
      ...animationOptions,
      onUpdate(value) {
        element.textContent = value.toFixed(precision);
      },
    });

    // changing previous value
    previousValue.current = value;

    // Cancel on unmount
    return () => {
      controls.stop();
    };
  }, [ref, inView, value]);

  return (
    <span className={className} ref={ref}>
      {value.toFixed(precision)}
    </span>
  );
};

export default AnimatedNumber;
