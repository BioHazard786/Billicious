"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import React, { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

type Member = {
  name: string;
  avatar_url?: string;
};

type AvatarCirclesProps = {
  className?: string;
  limit?: number;
  members: Member[];
};

const AvatarCircle: React.FC<{
  member: Member;
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
        <Avatar className={className}>
          <AvatarImage src={member.avatar_url} alt={member.name} />
          <AvatarFallback>{member.name[0]}</AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent>{member.name}</TooltipContent>
    </Tooltip>
  </motion.div>
));

const RemainingMembersCircle: React.FC<{ count: number; className?: string }> =
  React.memo(({ count, className }) => (
    <motion.div
      initial={{ opacity: 0, translateX: -50, scale: 0.5 }}
      animate={{ opacity: 1, translateX: 0, scale: 1 }}
      exit={{ opacity: 0, translateX: -50, scale: 0.5 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative rounded-full border-[2px] border-background hover:z-[100]",
      )}
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
            <span>{count}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>more members</TooltipContent>
      </Tooltip>
    </motion.div>
  ));

const AvatarCircles: React.FC<AvatarCirclesProps> = ({
  limit = 6,
  className,
  members,
}) => {
  const visibleMembers = useMemo(
    () => members.slice(0, limit),
    [members, limit],
  );
  const remainingMembers = members.length - limit;

  return (
    <div className="z-10 flex -space-x-4 rtl:space-x-reverse">
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
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(AvatarCircles);
