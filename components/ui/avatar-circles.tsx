"use client";

import { TMembers } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import React, { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

type AvatarCirclesProps = {
  className?: string;
  containerClassName?: string;
  hideExtraMembers?: boolean;
  limit?: number;
  members: TMembers[];
};

const AvatarCircle: React.FC<{
  member: TMembers;
  index: number;
  className?: string;
}> = React.memo(({ member, index, className }) => (
  <motion.div
    initial={{ opacity: 0, translateX: -50, scale: 0.5 }}
    animate={{ opacity: 1, translateX: 0, scale: 1 }}
    exit={{ opacity: 0, translateX: -50, scale: 0.5 }}
    transition={{ duration: 0.2 }}
    whileHover={{ translateX: -4 }}
    className={cn(
      "relative rounded-full border-[2px] border-background hover:z-[100]",
      `z-[${(index + 1) * 10}]`,
    )}
  >
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar className={cn("relative", className)}>
          <AvatarImage src={member.avatarUrl} alt={member.name} />
          {member.status === 1 && member.avatarUrl && (
            <div
              className={cn(
                "absolute inset-0 rounded-full",
                "bg-black/50",
                "pointer-events-none",
              )}
            />
          )}
          <AvatarFallback>{member.name[0]}</AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent>{member.name}</TooltipContent>
    </Tooltip>
  </motion.div>
));

const RemainingMembersCircle: React.FC<{
  count: number;
  className?: string;
  hideExtraMembers?: boolean;
}> = React.memo(({ count, className, hideExtraMembers }) => (
  <motion.div
    initial={{ opacity: 0, translateX: -50, scale: 0.5 }}
    animate={{ opacity: 1, translateX: 0, scale: 1 }}
    exit={{ opacity: 0, translateX: -50, scale: 0.5 }}
    transition={{ duration: 0.2 }}
    className="relative rounded-full border-[2px] border-background hover:z-[100]"
  >
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-primary",
            className,
          )}
        >
          <Plus size={10} />
          {!hideExtraMembers && <span>{count}</span>}
        </div>
      </TooltipTrigger>
      <TooltipContent>more members</TooltipContent>
    </Tooltip>
  </motion.div>
));

const AvatarCircles: React.FC<AvatarCirclesProps> = ({
  limit = 6,
  className,
  containerClassName,
  hideExtraMembers,
  members,
}) => {
  const visibleMembers = useMemo(
    () => members.slice(0, limit),
    [members, limit],
  );
  const remainingMembers = members.length - limit;

  return (
    <div
      className={cn(
        "z-10 flex -space-x-4 rtl:space-x-reverse",
        containerClassName,
      )}
    >
      <AnimatePresence initial={false}>
        {visibleMembers.map((member, index) => (
          <AvatarCircle
            key={`member-avatar-${index}`}
            member={member}
            index={index}
            className={className}
          />
        ))}
        {remainingMembers > 0 && (
          <RemainingMembersCircle
            count={remainingMembers}
            className={className}
            hideExtraMembers={hideExtraMembers}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(AvatarCircles);
