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
import { useParams, useRouter } from "next/navigation";
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
import { addMemberFormSchema } from "@/lib/schema";
import { cn, formatMemberData, isAppleDevice, titleCase } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import AnimatedButton from "../ui/animated-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

export default function AddMembers() {
  const members = useDashboardStore((state) => state.members);
  return (
    <Card className="m-3 mt-[4.2rem] lg:ml-[4.2rem]">
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
                    <p className="max-w-14 truncate md:max-w-32 lg:w-full">
                      {member.name}
                    </p>
                  </span>
                </TableCell>
                <TableCell
                  className={
                    member.balance >= 0
                      ? "font-mono text-primary"
                      : "font-mono text-destructive"
                  }
                >
                  {member.balance < 0
                    ? `-₹${(-member.balance).toFixed(2)}`
                    : `₹${member.balance.toFixed(2)}`}
                </TableCell>
                <TableCell className="hidden font-mono md:table-cell">
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
  const isApple = isAppleDevice();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const updateMembers = useDashboardStore((state) => state.addMember);
  const [isOpen, setIsOpen] = useState(false);
  const { slug } = useParams();

  const form = useForm<z.infer<typeof addMemberFormSchema>>({
    resolver: zodResolver(addMemberFormSchema),
    defaultValues: {
      full_name: "",
    },
  });

  const { isPending, mutate: server_addMembersToGroup } = useMutation({
    mutationFn: addMembersToGroupInDB,
    onMutate: () => {
      const toastId = toast.loading("Adding Member...");
      return { toastId };
    },
    onSuccess: (data, variables, context) => {
      const newMember = formatMemberData(data);
      updateMembers(newMember);
      setIsOpen(false);
      return toast.success("Member added successfully", {
        id: context.toastId,
      });
    },
    onError: (error, variables, context) => {
      console.log(error);
      return toast.error("Error on adding Member", {
        id: context?.toastId,
      });
    },
  });

  const addMembersToGroup = async (
    data: z.infer<typeof addMemberFormSchema>,
  ) => {
    server_addMembersToGroup({
      group_id: slug as string,
      members: [titleCase(data.full_name)],
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
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(addMembersToGroup)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem className="py-4 text-center">
                    <div className="flex items-center gap-4">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="name"
                          id="name"
                          placeholder="Zaid"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <AnimatedButton isLoading={isPending} variant="default">
                  Add
                </AnimatedButton>
              </DialogFooter>
            </form>
          </Form>
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
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(addMembersToGroup)}
            className="flex flex-col"
          >
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem className="p-4 text-center">
                  <div className="flex items-center gap-4">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        className={cn("col-span-3", isApple ? "text-base" : "")}
                        autoComplete="name"
                        id="name"
                        placeholder="Zaid"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DrawerFooter>
              <AnimatedButton isLoading={isPending} variant="default">
                Add
              </AnimatedButton>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
};
