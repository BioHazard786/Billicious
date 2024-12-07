import { useAppleDevice } from "@/hooks/use-apple-device";
import useDebounce from "@/hooks/use-debounce";
import { PermanentUser, TMembers } from "@/lib/types";
import { formatMemberData } from "@/lib/utils";
import {
  addMembersToGroupInDB,
  searchUsername,
  sendInvite,
} from "@/server/fetchHelpers";
import useMemberTabStore from "@/store/add-member-tab-store";
import useDashboardStore from "@/store/dashboard-store";
import useUserInfoStore from "@/store/user-info-store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronsUpDown } from "lucide-react";
import { useParams } from "next/navigation";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { toast } from "sonner";
import AnimatedButton from "../ui/animated-button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Spinner } from "../ui/spinner";

type SearchData = {
  results: PermanentUser[];
};

const InvitePermanentMember = ({
  setIsOpen,
  existingMember,
}: {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  existingMember?: TMembers | null;
}) => {
  const { slug } = useParams();

  const [selectedUser, setSelectedUser] = useState<PermanentUser | null>(null);

  const { isAppleDevice } = useAppleDevice();
  const [search, setSearch] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const debouncedSearch = useDebounce(search, 500);

  const members = useDashboardStore((state) => state.members);
  const addMember = useDashboardStore((state) => state.addMember);
  const updateMember = useDashboardStore((state) => state.updateMember);
  const admin = useUserInfoStore((state) => state.user);
  const resetSelectedTab = useMemberTabStore.use.reset();

  const {
    isLoading: isSearching,
    isError: isSearchError,
    data: searchData = {} as SearchData,
    error: searchError,
  } = useQuery<SearchData, Error>({
    queryKey: ["username-search", debouncedSearch],
    queryFn: () => searchUsername(debouncedSearch),
    enabled: debouncedSearch.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const {
    isPending: isPendingNewUserInvite,
    mutate: server_inviteNewUserToGroup,
  } = useMutation({
    mutationFn: addMembersToGroupInDB,
    onMutate: (variables) => {
      const toastId = toast.loading(`Inviting ${variables.name}...`);
      return { toastId };
    },
    onSuccess: (data, variables, context) => {
      const newMember = formatMemberData(data);
      addMember(newMember);
      return toast.success(`${variables.name} invited successfully`, {
        id: context.toastId,
      });
    },
    onError: (error, variables, context) => {
      console.error(error);
      return toast.error(error.message, {
        id: context?.toastId,
      });
    },
    onSettled: () => {
      setIsOpen(false);
      setSearch("");
      resetSelectedTab();
    },
  });

  const { isPending: isPendingUserInvite, mutate: server_inviteUserToGroup } =
    useMutation({
      mutationFn: sendInvite,
      onMutate: (variables) => {
        const toastId = toast.loading(`Inviting ${variables.name}...`);
        return { toastId };
      },
      onSuccess: (data, variables, context) => {
        const invitedMember = {
          name: existingMember?.name as string,
          memberId: selectedUser?.id as string,
          memberIndex: existingMember?.memberIndex as string,
          username: selectedUser?.username ?? undefined,
          avatarUrl: selectedUser?.avatar_url ?? undefined,
          isAdmin: false,
          status: 1,
          balance: existingMember?.balance as number,
          totalPaid: existingMember?.totalPaid as number,
        };
        updateMember(invitedMember);
        return toast.success(`${variables.name} invited successfully`, {
          id: context.toastId,
        });
      },
      onError: (error, variables, context) => {
        console.error(error);
        return toast.error(error.message, {
          id: context?.toastId,
        });
      },
      onSettled: () => {
        setIsOpen(false);
        setSearch("");
      },
    });

  const handleInviteMember = useCallback(
    (user: PermanentUser) => {
      if (admin?.username === user.username) {
        return toast.error("This user is admin");
      }
      if (members.some((member) => member.username === user.username)) {
        return toast.error("This user is already invited");
      }
      if (!existingMember) {
        server_inviteNewUserToGroup({
          name: user.name,
          usernames: [user.username],
          groupId: slug as string,
          userId: admin?.id as string,
        });
      } else {
        server_inviteUserToGroup({
          name: user.name,
          senderUserId: admin?.id as string,
          receiverUsername: user.username,
          groupId: slug as string,
          userIndex: Number(existingMember.memberIndex),
        });
      }
    },
    [admin, members],
  );

  return (
    <div className="space-y-4 p-4 pt-0 md:p-0">
      <div className="space-y-2">
        <Label>Invite Members</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              disabled={isPendingNewUserInvite || isPendingUserInvite}
              aria-expanded={open}
              className="h-10 w-full justify-between font-normal"
            >
              {selectedUser ? (
                <UserAvatarDetails user={selectedUser} />
              ) : (
                "Select username..."
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="z-[102] w-[--radix-popper-anchor-width] p-0">
            <Command>
              <CommandInput
                placeholder="Search username..."
                className={isAppleDevice ? "h-10 text-base" : "h-10"}
                containerClassName="hidden md:flex"
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                <CommandEmpty>
                  {isSearching ? (
                    <Spinner
                      loadingSpanClassName="bg-muted-foreground"
                      className="mx-auto"
                    />
                  ) : isSearchError ? (
                    searchError.message
                  ) : debouncedSearch.length === 0 ? (
                    "Type to search username"
                  ) : (
                    "No username found"
                  )}
                </CommandEmpty>
                {!isSearchError && searchData.results && (
                  <CommandGroup>
                    {searchData.results.map((user: PermanentUser) => (
                      <CommandItem
                        value={user.username}
                        key={user.username}
                        className="cursor-pointer"
                        onSelect={() => {
                          setSelectedUser(user);
                          setOpen(false);
                        }}
                      >
                        <Avatar>
                          <AvatarImage src={user.avatar_url} alt={user.name} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="ml-3 flex flex-col">
                          <span>{user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            @{user.username}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
              <CommandInput
                placeholder="Search username..."
                className={isAppleDevice ? "h-10 text-base" : "h-10"}
                containerClassName="md:hidden border-b-0 border-t"
                value={search}
                onValueChange={setSearch}
              />
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <AnimatedButton
        isLoading={isPendingNewUserInvite || isPendingUserInvite}
        variant="default"
        className="w-full"
        isDisabled={
          !selectedUser || isPendingNewUserInvite || isPendingUserInvite
        }
        onClick={() => handleInviteMember(selectedUser as PermanentUser)}
      >
        Invite
      </AnimatedButton>
    </div>
  );
};

const UserAvatarDetails = ({ user }: { user: PermanentUser }) => {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-7">
        <AvatarImage src={user.avatar_url} alt={user.name} />
        <AvatarFallback>{user.name[0]}</AvatarFallback>
      </Avatar>
      <div>
        <span>{user.name}</span>
        <span className="ml-1 text-xs text-muted-foreground">
          (@{user.username})
        </span>
      </div>
    </div>
  );
};

export default InvitePermanentMember;
