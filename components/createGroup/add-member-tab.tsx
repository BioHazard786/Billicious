import { useAppleDevice } from "@/hooks/use-apple-device";
import useDebounce from "@/hooks/use-debounce";
import { useMediaQuery } from "@/hooks/use-media-query";
import { PermanentUser } from "@/lib/types";
import { titleCase } from "@/lib/utils";
import { searchUsername } from "@/server/fetchHelpers";
import useMemberTabStore from "@/store/add-member-tab-store";
import useCreateGroup from "@/store/create-group-store";
import useUserStore from "@/store/user-info-store";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronsUpDown,
  Link,
  Plus,
  UserCheck,
  UserMinus,
  X,
} from "lucide-react";
import React, { memo, useCallback, useState } from "react";
import { toast } from "sonner";
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
import { InputWithLimit } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import ResponsiveHeader from "../ui/responsive-header";
import { ScrollArea } from "../ui/scroll-area";
import { AnimatedSpinner, Spinner } from "../ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const AddMemberTab = () => {
  const currentSelectedTab = useMemberTabStore.use.currentSelectedTab();
  const setCurrentSelectedTab = useMemberTabStore.use.setCurrentSelectedTab();

  return (
    <>
      <ResponsiveHeader
        isDesktop={true}
        title="Add Members"
        description="Add members to group permanent or temporary"
      />
      <ResponsiveHeader
        isDesktop={false}
        title="Add Members"
        description="Add members to group permanent or temporary"
      />
      <Tabs
        value={currentSelectedTab}
        onValueChange={(tabName) => setCurrentSelectedTab(tabName)}
        className="w-full space-y-4 px-4 lg:px-2"
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
              <Link className="mr-2 hidden size-4 md:block" />
              Invite Link
            </TabsTrigger> */}
          </TabsList>
        </div>
        <TabsContent value="temporary">
          <AddTemporaryMembers />
        </TabsContent>
        <TabsContent value="permanent">
          <AddPermanentMembers />
        </TabsContent>
        {/* <TabsContent value="invite">
          <div> </div>
        </TabsContent> */}
      </Tabs>
    </>
  );
};

const AddTemporaryMembers = () => {
  const { isAppleDevice } = useAppleDevice();
  const temporaryMembers = useCreateGroup.use.temporaryMemberNames();
  const addTemporaryMember = useCreateGroup.use.addTemporaryMemberName();
  const removeTemporaryMember = useCreateGroup.use.removeTemporaryMemberName();
  const admin = useUserStore((state) => state.user);

  const [memberName, setName] = useState("");

  const handleAddMember = useCallback(() => {
    if (!memberName || memberName.length < 2) {
      setName("");
      return toast.error("Name must contain at least 2 character(s)");
    }
    if (memberName.length > 32) {
      setName("");
      return toast.error("Name must contain at most 32 character(s)");
    }

    if (admin?.name.toLowerCase() === memberName.toLowerCase()) {
      setName("");
      return toast.error("This member is admin");
    }

    if (
      temporaryMembers.some(
        (name) => name.toLowerCase() === memberName.toLowerCase(),
      )
    ) {
      setName("");
      return toast.error("Member already exists");
    }

    addTemporaryMember(titleCase(memberName));
    setName("");
  }, [memberName, temporaryMembers, addTemporaryMember, admin]);

  return (
    <div className="space-y-2">
      <Label>Add Temporary Members</Label>
      <div className="flex h-full w-full items-center justify-stretch gap-2">
        <InputWithLimit
          maxLength={32}
          characterCount={memberName.length}
          className={isAppleDevice ? "text-base" : ""}
          autoComplete="name"
          id="temporaryMembers"
          placeholder="Sweetie Pie"
          value={memberName}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
        />
        <Button
          variant="outline"
          size="icon"
          className="size-10"
          onClick={handleAddMember}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <MemberList members={temporaryMembers} onRemove={removeTemporaryMember} />
    </div>
  );
};

type SearchData = {
  results: PermanentUser[];
};

const AddPermanentMembers = () => {
  const { isAppleDevice } = useAppleDevice();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const permanentMembers = useCreateGroup.use.permanentMembers();
  const addPermanentMember = useCreateGroup.use.addPermanentMember();
  const removePermanentMember = useCreateGroup.use.removePermanentMember();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [open, setOpen] = useState<boolean>(false);

  const admin = useUserStore((state) => state.user);

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

  const handleAddMember = useCallback(
    (user: PermanentUser) => {
      if (admin?.username === user.username) {
        toast.error("This user is admin");
        return;
      }
      if (
        permanentMembers.some((member) => member.username === user.username)
      ) {
        toast.error("This user is already invited");
        return;
      }
      addPermanentMember(user);
      setSearch("");
      setOpen(false);
    },
    [admin, permanentMembers, addPermanentMember],
  );

  return (
    <div className="space-y-2">
      <Label>Invite Permanent Members</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-10 w-full justify-between font-normal"
          >
            Select Username
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="z-[102] w-[--radix-popper-anchor-width] p-0"
          side={isDesktop ? undefined : "top"}
        >
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
                  {searchData.results.map((member: PermanentUser) => (
                    <CommandItem
                      value={member.username}
                      key={member.username}
                      className="cursor-pointer"
                      onSelect={() => handleAddMember(member)}
                    >
                      <Avatar>
                        <AvatarImage
                          src={member.avatar_url}
                          alt={member.name}
                        />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 flex flex-col">
                        <span>{member.name}</span>
                        <span className="text-xs text-muted-foreground">
                          @{member.username}
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
      <MemberList
        members={permanentMembers}
        onRemove={removePermanentMember}
        isPermanent={true}
      />
    </div>
  );
};

type MemberListProps = {
  members: PermanentUser[] | string[];
  onRemove: (member: string) => void;
  isPermanent?: boolean;
};

const MemberList: React.FC<MemberListProps> = memo(
  ({ members, onRemove, isPermanent = false }) => (
    <ScrollArea className="h-[92px]">
      <ul className="flex flex-wrap gap-2">
        <AnimatePresence presenceAffectsLayout>
          {members.map((member, index) => (
            <MemberItem
              key={`${isPermanent ? "permanent" : "temporary"}-member-${index}`}
              name={
                isPermanent
                  ? (member as PermanentUser).name
                  : (member as string)
              }
              avatar_url={
                isPermanent ? (member as PermanentUser).avatar_url : undefined
              }
              onRemove={() =>
                onRemove(
                  isPermanent
                    ? (member as PermanentUser).username
                    : (member as string),
                )
              }
            />
          ))}
        </AnimatePresence>
      </ul>
    </ScrollArea>
  ),
);

MemberList.displayName = "MemberList";

type MemberItemProps = {
  name: string;
  avatar_url?: string;
  onRemove: () => void;
};

const MemberItem: React.FC<MemberItemProps> = memo(
  ({ name, avatar_url, onRemove }) => (
    <motion.li
      animate={{ opacity: 1, scale: 1 }}
      initial={{ opacity: 0, scale: 0 }}
      exit={{ opacity: 0 }}
      // whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="flex cursor-default items-center gap-2 rounded-full border bg-background text-sm"
    >
      <Avatar className="size-8">
        <AvatarImage src={avatar_url} alt={name} />
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>
      <span className="max-w-14 truncate">{name}</span>
      <Button
        variant="ghost"
        type="button"
        size="icon"
        onClick={onRemove}
        onKeyDown={(e) => e.key === "Enter" && onRemove()}
        className="size-8 rounded-full"
      >
        <X className="size-[0.85rem]" />
      </Button>
    </motion.li>
  ),
);

MemberItem.displayName = "MemberItem";

export default AddMemberTab;
