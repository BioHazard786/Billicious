"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addMembersToGroupInDB } from "@/server/fetchHelpers";
import useDashboardStore from "@/store/dashboard-store";
import { useMutation } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "../ui/avatar";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { formatMemberData, titleCase } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { forwardRef, useRef, useState } from "react";
import Spinner from "../ui/spinner";

export default function AddMembers() {
  const members = useDashboardStore((state) => state.members);
  return (
    <Card className="m-3 lg:ml-[4.2rem]">
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>
          Manage your members and view their expenses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead className="hidden md:table-cell">Total Paid</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member, index) => (
              <TableRow key={`add-member-${index}`}>
                <TableCell>
                  <span className="flex items-center gap-2 md:gap-3">
                    <Avatar className="size-8 md:size-10">
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    {member.name}
                  </span>
                </TableCell>
                <TableCell
                  className={
                    member.balance >= 0 ? "text-primary" : "text-destructive"
                  }
                >
                  {member.balance < 0
                    ? `-₹${(-member.balance).toFixed(2)}`
                    : `₹${member.balance.toFixed(2)}`}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  ₹{member.totalPaid}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-left flex items-center">
        <MemberAddDialog />
      </CardFooter>
    </Card>
  );
}

const MemberAddDialog = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const updateMembers = useDashboardStore((state) => state.addMember);
  const [isOpen, setIsOpen] = useState(false);
  const memberRef = useRef<HTMLInputElement>(null);
  const { slug } = useParams();

  const { isPending, mutate: server_addMembersToGroup } = useMutation({
    mutationFn: addMembersToGroupInDB,
    onSuccess: (data) => {
      const newMember = formatMemberData(data);
      updateMembers(newMember);
      setIsOpen(false);
      return toast.success("Member added successfully");
    },
    onError: (error) => {
      console.log(error);
      return toast.error("Error on adding Member");
    },
  });

  const addMembersToGroup = () => {
    if (memberRef.current!.value.length <= 2) {
      return toast.error("Name must be atleast 3 characters");
    }

    server_addMembersToGroup({
      group_id: slug as string,
      members: [titleCase(memberRef.current!.value)],
    });
  };

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">Add Member</Button>
        </DialogTrigger>
        <DialogContent className="z-[101] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>
              Add member to group. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Member's name"
                className="col-span-3"
                ref={memberRef}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-[75px]"
              variant="default"
              disabled={isPending}
              onClick={addMembersToGroup}
            >
              <AnimatePresence initial={false} mode="wait">
                {isPending ? (
                  <Spinner
                    key="spinner"
                    AnimationProps={{
                      initial: { y: "100%", opacity: 0 },
                      animate: { y: 0, opacity: 1 },
                      exit: { y: "-100%", opacity: 0 },
                      transition: { ease: "easeInOut", duration: 0.2 },
                    }}
                  />
                ) : (
                  <motion.span
                    key="button-text"
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ ease: "easeInOut", duration: 0.2 }}
                  >
                    Add
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className="w-full">Add Member</Button>
      </DrawerTrigger>
      <DrawerContent className="z-[101]">
        <DrawerHeader>
          <DrawerTitle>Add Member</DrawerTitle>
          <DrawerDescription>
            Add member to group. Click save when you're done.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex items-center gap-4 p-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input
            id="name"
            placeholder="Member's name"
            className="col-span-3"
            ref={memberRef}
          />
        </div>
        <DrawerFooter>
          <AnimatePresence presenceAffectsLayout initial={false}>
            <Button
              type="submit"
              variant="default"
              className="w-full"
              onClick={addMembersToGroup}
              disabled={isPending}
            >
              {isPending && <Spinner className="mr-[0.35rem]" />}
              <motion.span
                layout
                transition={{ ease: "easeInOut", duration: 0.2 }}
              >
                Add
              </motion.span>
            </Button>
          </AnimatePresence>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
