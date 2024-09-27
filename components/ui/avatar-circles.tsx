"use client";

import React, { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

type AvatarCirclesProps = {
  className?: string;
  limit?: number;
  members: { name: string; avatar_url?: string }[];
};

const AvatarCircles = ({
  limit = 6,
  className,
  members,
}: AvatarCirclesProps) => {
  const memberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (members.length > limit) {
      memberRef.current!.textContent = String(members.length - 6);
    }
  }, []);

  return (
    <div className="z-10 flex -space-x-4 rtl:space-x-reverse">
      <AnimatePresence initial={false}>
        {members.map((member, index) =>
          index <= limit ? (
            <motion.div
              key={`member-avatar-${index}`}
              style={{
                zIndex: index + 1 * 10,
              }}
              initial={{ opacity: 0, translateX: -50, scale: 0.5 }}
              animate={{ opacity: 1, translateX: 0, scale: 1 }}
              exit={{ opacity: 0, translateX: -50, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="rounded-full border-[3px] border-background"
            >
              {index < 6 ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className={className}>
                      <AvatarImage src={member.avatar_url} alt={member.name} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>{member.name}</TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
                      <Plus size={10} />
                      <span ref={memberRef}></span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>more</TooltipContent>
                </Tooltip>
              )}
            </motion.div>
          ) : memberRef.current ? (
            (memberRef.current!.textContent = String(index - limit - 1))
          ) : null,
        )}
      </AnimatePresence>
    </div>
  );
};

export default AvatarCircles;
