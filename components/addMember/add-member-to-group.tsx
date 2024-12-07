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
import { CURRENCIES } from "@/constants/items";
import { TMembers } from "@/lib/types";
import { cn } from "@/lib/utils";
import { createAdmin, declineInvite, deleteAdmin } from "@/server/fetchHelpers";
import useMemberTabStore from "@/store/add-member-tab-store";
import useDashboardStore from "@/store/dashboard-store";
import useUserInfoStore from "@/store/user-info-store";
import { useMutation } from "@tanstack/react-query";
import { Link, MoreHorizontal, UserCheck, UserMinus } from "lucide-react";
import { useParams } from "next/navigation";
import { Dispatch, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import ResponsiveDialog from "../ui/responsive-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import AddTemporaryMember from "./add-temporary-member";
import InvitePermanentMember from "./invite-permanent-member";

export default function AddMembers() {
  const { slug: groupId } = useParams();
  const temporaryMember = useRef<TMembers | null>(null);
  const user = useUserInfoStore((state) => state.user);
  const members = useDashboardStore((state) => state.members);
  const makeAdmin = useDashboardStore((state) => state.makeAdmin);
  const removeAdmin = useDashboardStore((state) => state.removeAdmin);
  const deleteInvite = useDashboardStore((state) => state.removeInvite);
  const currencyCode = useDashboardStore((state) => state.currencyCode);
  const currencySymbol = useMemo(
    () => CURRENCIES[currencyCode || "INR"].currencySymbol,
    [currencyCode],
  );
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);
  const handleToggle = (id: string) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  const isAdmin = useMemo(() => {
    return (
      members.find((member) => member.memberId === user?.id)?.isAdmin ?? false
    );
  }, [members, user]);

  const isOwner = useMemo(() => {
    return members[0].memberId === user?.id;
  }, [members, user]);

  const { isPending: isPendingMakingAdmin, mutate: server_makeAdmin } =
    useMutation({
      mutationFn: createAdmin,
      onMutate: (variables) => {
        const toastId = toast.loading(
          `Making ${members[variables.userIndex].name} admin...`,
        );
        return { toastId };
      },
      onSuccess: (data, variables, context) => {
        makeAdmin(variables.userIndex);
        return toast.success(
          `${members[variables.userIndex].name} has been successfully made an admin.`,
          {
            id: context.toastId,
          },
        );
      },
      onError: (error, variables, context) => {
        console.error(error);
        return toast.error(error.message, {
          id: context?.toastId,
        });
      },
    });

  const { isPending: isPendingRemovingAdmin, mutate: server_removeAdmin } =
    useMutation({
      mutationFn: deleteAdmin,
      onMutate: (variables) => {
        const toastId = toast.loading(
          `Revoking admin rights for ${members[variables.userIndex].name}...`,
        );
        return { toastId };
      },
      onSuccess: (data, variables, context) => {
        removeAdmin(variables.userIndex);
        return toast.success(
          `Successfully revoked ${members[variables.userIndex].name}'s admin rights.`,
          {
            id: context.toastId,
          },
        );
      },
      onError: (error, variables, context) => {
        console.error(error);
        return toast.error(error.message, {
          id: context?.toastId,
        });
      },
    });

  const { isPending: isPendingDeleteInvite, mutate: server_deleteInvite } =
    useMutation({
      mutationFn: declineInvite,
      onMutate: () => {
        const toastId = toast.loading(`Deleting invite...`);
        return { toastId };
      },
      onSuccess: (data, variables, context) => {
        deleteInvite(variables.userIndex as number);
        return toast.success(`Deleted successfully`, {
          id: context.toastId,
        });
      },
      onError: (error, variables, context) => {
        return toast.error(error.message, {
          id: context?.toastId,
        });
      },
    });

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
      <Card className="m-3 mb-[5.563rem] mt-[4.063rem] lg:mb-3 lg:ml-[4.313rem]">
        <CardHeader>
          <CardTitle>Group Members</CardTitle>
          <CardDescription>
            Manage members, assign roles, and invite new users
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
                      <Avatar className="relative size-8 md:size-10">
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
                      <span className="flex flex-col">
                        <span className="max-w-14 truncate md:max-w-32 lg:w-full">
                          {member.name}
                        </span>
                        {member.username && (
                          <span className="max-w-14 truncate text-xs text-muted-foreground md:max-w-32 lg:w-full">
                            @{member.username}
                          </span>
                        )}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <MemberBadge
                      member={member}
                      ownerId={members[0].memberId}
                    />
                  </TableCell>
                  <TableCell
                    className={cn(
                      "hidden font-mono md:table-cell",
                      member.balance >= 0 ? "text-primary" : "text-destructive",
                    )}
                  >
                    {member.balance < 0
                      ? `-${currencySymbol}${(-member.balance).toFixed(2)}`
                      : `${currencySymbol}${member.balance.toFixed(2)}`}
                  </TableCell>
                  <TableCell className="hidden font-mono md:table-cell">
                    {currencySymbol}
                    {member.totalPaid}
                  </TableCell>
                  <TableCell>
                    {shouldRenderDropdown(
                      { isOwner, isAdmin },
                      {
                        owner: member.memberIndex === "0",
                        admin: member.isAdmin,
                        permanent: member.status === 2 && !member.isAdmin,
                      },
                    ) && (
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
                          {isOwner &&
                            member.status === 2 &&
                            !member.isAdmin && (
                              <DropdownMenuItem
                                disabled={isPendingMakingAdmin}
                                onClick={() =>
                                  server_makeAdmin({
                                    groupId: groupId as string,
                                    ownerId: user?.id,
                                    userIndex: Number(member.memberIndex),
                                  })
                                }
                              >
                                Make Admin
                              </DropdownMenuItem>
                            )}
                          {isOwner &&
                            member.isAdmin &&
                            member.memberId !== user?.id && (
                              <DropdownMenuItem
                                disabled={isPendingRemovingAdmin}
                                onClick={() =>
                                  server_removeAdmin({
                                    groupId: groupId as string,
                                    ownerId: user?.id,
                                    userIndex: Number(member.memberIndex),
                                  })
                                }
                              >
                                Remove Admin
                              </DropdownMenuItem>
                            )}
                          {isAdmin && member.status === 1 && (
                            <DropdownMenuItem
                              disabled={isPendingDeleteInvite}
                              onClick={() =>
                                server_deleteInvite({
                                  groupId: groupId as string,
                                  userId: member.memberId,
                                  userIndex: Number(member.memberIndex),
                                })
                              }
                            >
                              Delete Invite
                            </DropdownMenuItem>
                          )}
                          {isAdmin && member.status === 0 && (
                            <DropdownMenuItem
                              onClick={() => {
                                temporaryMember.current = member;
                                setIsInviteMemberOpen(true);
                              }}
                            >
                              Invite
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        {isAdmin && (
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
        )}
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
              <UserMinus className="mr-2 size-4" />
              Temporary
            </TabsTrigger>
            <TabsTrigger value="permanent">
              <UserCheck className="mr-2 size-4" />
              Permanent
            </TabsTrigger>
            {/* <TabsTrigger value="invite">
              <Link className="mr-2 hidden size-4 md:visible" />
              Invite Link
            </TabsTrigger> */}
          </TabsList>
        </div>
        <TabsContent value="temporary" className="p-4 pt-0 md:p-0">
          <AddTemporaryMember setIsOpen={setIsOpen} />
        </TabsContent>
        <TabsContent value="permanent">
          <InvitePermanentMember setIsOpen={setIsOpen} />
        </TabsContent>
        {/* <TabsContent value="invite" className="p-4 pt-0 md:p-0">
          <div> </div>
        </TabsContent> */}
      </Tabs>
    </ResponsiveDialog>
  );
};

const MemberBadge = ({
  member,
  ownerId,
}: {
  member: TMembers;
  ownerId: string;
}) => {
  const statusText =
    member.status === 2
      ? member.isAdmin
        ? ownerId === member.memberId
          ? "Owner"
          : "Admin"
        : "Permanent"
      : member.status === 1
        ? "Invited"
        : "Temporary";

  const color: Record<string, string> = {
    Owner: "crimson",
    Admin: "teal",
    Permanent: "plum",
    Temporary: "amber",
    Invited: "cyan",
  };

  return (
    <Badge className="text-xs" variant="color" color={color[statusText]}>
      {statusText}
    </Badge>
  );
};

const shouldRenderDropdown = (
  currentUser: {
    isOwner: boolean;
    isAdmin: boolean;
  },
  rowMember: {
    owner: boolean;
    admin: boolean;
    permanent?: boolean;
  },
): boolean => {
  if (currentUser.isOwner) {
    return !rowMember.owner;
  }

  if (currentUser.isAdmin) {
    return !rowMember.admin && !rowMember.owner && !rowMember.permanent;
  }

  return false;
};
