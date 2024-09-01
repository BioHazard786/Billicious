"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardContentMotion,
  CardDescription,
  CardFooter,
  CardHeader,
  CardMotion,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/spinner";
import { titleCase } from "@/lib/utils";
import useCreateGroup from "@/store/create-group-store";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useRef } from "react";
import { toast } from "sonner";

type GroupData = {
  name: string;
  users: string[];
};

const CreateGroupForm = () => {
  const {
    memberNames,
    groupNameError,
    memberNameError,
    setMemberNames,
    setGroupNameError,
    setMemberNameError,
    setCreateGroupState,
  } = useCreateGroup((state) => state);

  const memberRef = useRef<HTMLInputElement>(null);
  const groupNameRef = useRef<HTMLInputElement>(null);
  const navigate = useRouter();

  const addMembers = () => {
    if (memberRef.current!.value.length <= 2) {
      return setMemberNameError("Member Name should be atleast 2 characters");
    }

    if (
      memberNames.some(
        (name) => name.toLowerCase() === memberRef.current!.value.toLowerCase(),
      )
    ) {
      setMemberNameError("Member Name already exists");
      return (memberRef.current!.value = "");
    }

    const newNames: string[] = [
      ...memberNames,
      titleCase(memberRef.current!.value),
    ];
    setCreateGroupState(newNames, "", "");
    memberRef.current!.value = "";
  };

  const removeMembers = (memberName: string) => {
    const newMemberNames: string[] = memberNames.filter(
      (item) => item !== memberName,
    );
    setMemberNames(newMemberNames);
  };

  const { isPending, mutate: server_createGroup } = useMutation({
    mutationFn: async (groupData: GroupData) => {
      const response = await fetch("/api/create_group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(groupData),
      });

      if (!response.ok) {
        throw new Error("Failed to create group");
      }

      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      console.log(data);
      const path = `/group/${data.id}`;
      navigate.push(path);
    },
    onError: (error) => {
      console.log(error.name, error.message);
      return toast.error(
        "Error occured on Database. Try again after some time",
      );
    },
  });

  const createGroup = () => {
    if (groupNameRef.current!.value.length <= 2) {
      return setCreateGroupState(
        memberNames,
        "Group Name should be atleast 2 characters",
        "",
      );
    }
    if (memberNames.length < 2) {
      if (groupNameRef.current!.value.length <= 2)
        return setCreateGroupState(
          memberNames,
          "Group Name should be atleast 2 characters",
          "Add Atleast 1 Member",
        );
      else return setCreateGroupState(memberNames, "", "Add Atleast 1 Member");
    }

    const groupBody = {
      name: titleCase(groupNameRef.current!.value),
      users: memberNames,
    };

    server_createGroup(groupBody);
    setGroupNameError("");
  };

  return (
    <CardMotion layout className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Create Group</CardTitle>
        <CardDescription>
          Enter group name and members to create group
        </CardDescription>
      </CardHeader>
      <CardContentMotion layout className="grid gap-1">
        <div className="grid gap-2">
          <Label
            htmlFor="groupName"
            className={groupNameError ? "text-destructive" : ""}
          >
            Group Name
          </Label>
          <Input
            ref={groupNameRef}
            name="groupName"
            id="groupName"
            type="text"
            placeholder="m@example.com"
          />
          {groupNameError ? (
            <span className="text-xs text-destructive">{groupNameError}</span>
          ) : (
            <span className="invisible text-xs text-destructive">
              Group Name Error Placeholder
            </span>
          )}
        </div>
        <div className="grid gap-2">
          <Label
            htmlFor="memberName"
            className={memberNameError ? "text-destructive" : ""}
          >
            Member Name
          </Label>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              name="memberName"
              id="memberName"
              ref={memberRef}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addMembers();
                }
              }}
              type="text"
              placeholder="Zaid"
            />
            <Button variant="default" size="icon" onClick={addMembers}>
              <Plus className="size-4" />
            </Button>
          </div>
          {memberNameError ? (
            <span className="text-xs text-destructive">{memberNameError}</span>
          ) : (
            <span className="invisible text-xs text-destructive">
              Member Name Error Placeholder
            </span>
          )}
        </div>
        <ul className="flex flex-wrap gap-2">
          <AnimatePresence presenceAffectsLayout>
            {memberNames.map((name, index) => (
              <motion.li
                animate={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                key={`member-name-${index}`}
                className="inline-flex h-8 cursor-default items-center rounded-sm bg-secondary pl-2 text-sm text-secondary-foreground"
              >
                {name}
                <button
                  onClick={() => removeMembers(name)}
                  className="inline-flex h-full items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  <X className="size-[0.85rem]" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </CardContentMotion>
      <CardFooter>
        <AnimatePresence presenceAffectsLayout>
          <Button
            type="submit"
            variant="default"
            className="w-full"
            onClick={createGroup}
            disabled={isPending}
          >
            {isPending && <Spinner className="mr-[0.35rem]" />}
            <motion.span
              layout
              transition={{ ease: "easeInOut", duration: 0.2 }}
            >
              Create Group
            </motion.span>
          </Button>
        </AnimatePresence>
      </CardFooter>
    </CardMotion>
  );
};

export default CreateGroupForm;
