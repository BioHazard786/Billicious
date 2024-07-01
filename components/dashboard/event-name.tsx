import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useDashboardStore from "@/store/dashboard-store";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Users } from "lucide-react";
import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";

export default function EventName() {
  const [members, groupName] = useDashboardStore((group) => [
    group.members,
    group.name,
  ]);
  const memberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (members.length > 6) {
      memberRef.current!.textContent = String(members.length - 6);
    }
  }, []);

  return (
    <Card className="h-min">
      <CardHeader>
        <div className="flex items-center justify-between space-y-0">
          <CardTitle>{groupName}</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Splitting with</CardDescription>
      </CardHeader>
      <CardContent className="z-10 flex -space-x-4 rtl:space-x-reverse">
        <AnimatePresence initial={false}>
          {members.map((member, index) =>
            index <= 6 ? (
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
                      <Avatar>
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
              (memberRef.current!.textContent = String(index - 5))
            ) : null,
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
