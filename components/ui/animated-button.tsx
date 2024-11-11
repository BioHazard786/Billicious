"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  motion,
  type AnimationProps,
  type MotionProps,
} from "framer-motion";
import React, { memo } from "react";
import { AnimatedSpinner } from "./spinner";

type AnimatedButtonProps = ButtonProps &
  MotionProps & {
    isLoading: boolean;
    isDisabled?: boolean;
    spinnerClassName?: string;
    loadingSpanClassName?: string;
    animationProps?: AnimationProps;
  };

const MotionButton = motion.create(Button);

const AnimatedButton: React.FC<AnimatedButtonProps> = memo(
  ({
    isLoading,
    isDisabled = isLoading,
    className,
    spinnerClassName,
    loadingSpanClassName,
    animationProps,
    children,
    ...props
  }) => (
    <AnimatePresence presenceAffectsLayout initial={false}>
      <MotionButton
        layout
        {...props}
        className={className}
        disabled={isDisabled}
      >
        {isLoading && (
          <AnimatedSpinner
            className={cn("mr-2", spinnerClassName)}
            loadingSpanClassName={loadingSpanClassName}
            AnimationProps={animationProps}
          />
        )}
        <motion.span layout transition={{ ease: "easeInOut", duration: 0.2 }}>
          {children}
        </motion.span>
      </MotionButton>
    </AnimatePresence>
  ),
);

AnimatedButton.displayName = "AnimatedButton";

export default AnimatedButton;
