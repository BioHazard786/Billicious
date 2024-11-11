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
import useDashboardStore from "@/store/dashboard-store";
import { Link, MoreHorizontal, UserCheck, UserMinus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TMembers } from "@/lib/types";
import { cn, memberStatus } from "@/lib/utils";
import useMemberTabStore from "@/store/add-member-tab-store";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import AddTemporaryMember from "./add-temporary-member";
import InvitePermanentMember from "./invite-permanent-member";

export default function AddMembers() {
  const members = useDashboardStore((state) => state.members);

  return (
    <Card className="m-3 mb-[5.25rem] mt-16 md:mb-3 lg:ml-[4.2rem]">
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
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Balance</TableHead>
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
                      <AvatarImage src={member.avatarUrl} alt={member.name} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <p className="max-w-14 truncate md:max-w-32 lg:w-full">
                      {member.name}
                    </p>
                  </span>
                </TableCell>
                <TableCell>
                  <MemberBadge member={member} />
                </TableCell>
                <TableCell
                  className={cn(
                    "hidden font-mono md:table-cell",
                    member.balance >= 0 ? "text-primary" : "text-destructive",
                  )}
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
        <MemberAddPopup />
      </CardFooter>
    </Card>
  );
}

const MemberAddPopup = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isOpen, setIsOpen] = useState(false);
  const currentSelectedTab = useMemberTabStore.use.currentSelectedTab();
  const setCurrentSelectedTab = useMemberTabStore.use.setCurrentSelectedTab();

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
          <Tabs
            value={currentSelectedTab}
            onValueChange={(tabName) => setCurrentSelectedTab(tabName)}
            className="w-full space-y-6"
          >
            <div className="flex w-full justify-center">
              <TabsList className="w-min">
                <TabsTrigger value="temporary">
                  <UserMinus className="mr-2 size-4" />
                  Temporary
                </TabsTrigger>
                <TabsTrigger value="permanent">
                  <UserCheck className="mr-2 size-4" />
                  Permanent
                </TabsTrigger>
                <TabsTrigger value="invite">
                  <Link className="mr-2 size-4" />
                  Invite Link
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="temporary">
              <AddTemporaryMember setIsOpen={setIsOpen} />
            </TabsContent>
            <TabsContent value="permanent">
              <InvitePermanentMember setIsOpen={setIsOpen} />
            </TabsContent>
            <TabsContent value="invite">
              <div> </div>
            </TabsContent>
          </Tabs>
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
        <Tabs
          value={currentSelectedTab}
          onValueChange={(tabName) => setCurrentSelectedTab(tabName)}
          className="w-full space-y-6"
        >
          <div className="flex w-full justify-center">
            <TabsList className="w-min">
              <TabsTrigger value="temporary">Temporary</TabsTrigger>
              <TabsTrigger value="permanent">Permanent</TabsTrigger>
              <TabsTrigger value="invite">Invite Link</TabsTrigger>
            </TabsList>
          </div>
          <div className="p-4 pt-0">
            <TabsContent value="temporary">
              <AddTemporaryMember setIsOpen={setIsOpen} />
            </TabsContent>
            <TabsContent value="permanent">
              <InvitePermanentMember setIsOpen={setIsOpen} />
            </TabsContent>
            <TabsContent value="invite">
              <div> </div>
            </TabsContent>
          </div>
        </Tabs>
      </DrawerContent>
    </Drawer>
  );
};

const MemberBadge = ({ member }: { member: TMembers }) => {
  const statusText = memberStatus(member.status, member.isAdmin);

  const color: Record<string, string> = {
    Admin: "crimson",
    Permanent: "plum",
    Temporary: "orange",
    Invited: "cyan",
  };

  return (
    <Badge className="text-xs" variant="color" color={color[statusText]}>
      {statusText}
    </Badge>
  );
};
