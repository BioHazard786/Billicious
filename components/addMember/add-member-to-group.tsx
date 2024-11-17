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
  DropdownMenuSeparator,
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
} from "@/components/ui/dialog";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TMembers } from "@/lib/types";
import { cn, memberStatus } from "@/lib/utils";
import useMemberTabStore from "@/store/add-member-tab-store";
import { Dispatch, useRef, useState } from "react";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import AddTemporaryMember from "./add-temporary-member";
import InvitePermanentMember from "./invite-permanent-member";

export default function AddMembers() {
  const temporaryMember = useRef<TMembers | null>(null);
  const members = useDashboardStore((state) => state.members);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);
  const handleToggle = (id: string) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <ResponsiveDialog
        isOpen={isInviteMemberOpen}
        setIsOpen={setIsInviteMemberOpen}
        title="Invite Member"
        description="Invite member to group. Click invite when you're done."
      >
        <InvitePermanentMember
          setIsOpen={setIsInviteMemberOpen}
          existingMember={temporaryMember.current}
        />
      </ResponsiveDialog>
      <Card className="m-3 mb-[5.25rem] mt-16 lg:mb-3 lg:ml-[4.2rem]">
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
                <TableHead className="hidden md:table-cell">
                  Total Paid
                </TableHead>
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
                    <DropdownMenu
                      open={openDropdown === `add-member-${index}`}
                      onOpenChange={() => handleToggle(`add-member-${index}`)}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                        {member.status === 0 ? (
                          <DropdownMenuItem
                            onClick={() => {
                              temporaryMember.current = member;
                              setIsInviteMemberOpen(true);
                            }}
                          >
                            Invite
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-left flex items-center">
          <Button
            className="w-full"
            onClick={() => {
              setIsAddMemberOpen(true);
            }}
          >
            Add Member
          </Button>
        </CardFooter>
        <AddMemberDialog
          isOpen={isAddMemberOpen}
          setIsOpen={setIsAddMemberOpen}
        />
      </Card>
    </>
  );
}

const AddMemberDialog = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<React.SetStateAction<boolean>>;
}) => {
  const currentSelectedTab = useMemberTabStore.use.currentSelectedTab();
  const setCurrentSelectedTab = useMemberTabStore.use.setCurrentSelectedTab();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <ResponsiveDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Add Member"
      description="Add member to group. Click save when you're done."
    >
      <Tabs
        value={currentSelectedTab}
        onValueChange={(tabName) => setCurrentSelectedTab(tabName)}
        className="w-full space-y-6"
      >
        <div className="flex w-full justify-center">
          <TabsList className="w-min">
            <TabsTrigger value="temporary">
              {isDesktop && <UserMinus className="mr-2 size-4" />}
              Temporary
            </TabsTrigger>
            <TabsTrigger value="permanent">
              {isDesktop && <UserCheck className="mr-2 size-4" />}
              Permanent
            </TabsTrigger>
            <TabsTrigger value="invite">
              {isDesktop && <Link className="mr-2 size-4" />}
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
    </ResponsiveDialog>
  );
};

export function ResponsiveDialog({
  children,
  isOpen,
  setIsOpen,
  title,
  description,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  description?: string;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="z-[101] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent className="z-[101]">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        {children}
      </DrawerContent>
    </Drawer>
  );
}

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
