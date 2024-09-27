"use client";

import { Button } from "@/components/ui/button";
import {
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGroupFormSchema } from "@/lib/schema";
import { titleCase } from "@/lib/utils";
import { createGroupInDB } from "@/server/fetchHelpers";
import useCreateGroup from "@/store/create-group-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { CardContentMotion, CardMotion } from "../ui/motion-card";

const CreateGroupForm = () => {
  const form = useForm<z.infer<typeof createGroupFormSchema>>({
    resolver: zodResolver(createGroupFormSchema),
    defaultValues: {
      group_name: "",
      member_name: "",
    },
  });

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
      return setMemberNameError("Member Name should be atleast 3 characters");
    }

    if (memberRef.current!.value.length >= 32) {
      setMemberNameError("Member Name should be atmost 32 characters");
      return (memberRef.current!.value = "");
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
    mutationFn: createGroupInDB,
    onSuccess: (data) => {
      const path = `/group/${encodeURIComponent(data.group.id)}`;
      navigate.push(path);
    },
    onError: (error) => {
      console.log(error);
      return toast.error("Error occured on Database");
    },
  });

  const createGroup = () => {
    if (groupNameRef.current!.value.length <= 2) {
      return setCreateGroupState(
        memberNames,
        "Group Name should be atleast 3 characters",
        "",
      );
    }
    if (memberNames.length < 2) {
      if (groupNameRef.current!.value.length <= 2)
        return setCreateGroupState(
          memberNames,
          "Group Name should be atleast 3 characters",
          "Add Atleast 2 Member",
        );
      else return setCreateGroupState(memberNames, "", "Add Atleast 2 Member");
    }

    const groupBody = {
      name: titleCase(groupNameRef.current!.value),
      members: memberNames,
    };

    server_createGroup(groupBody);
    setGroupNameError("");
  };

  return (
    <CardMotion layout className="mx-4 max-w-sm md:mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create Group</CardTitle>
        <CardDescription>
          Enter group name and members to create group
        </CardDescription>
      </CardHeader>
      <CardContentMotion layout>
        {/* <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(addMembers)}>
            <FormField
              control={form.control}
              name="group_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      id="email"
                      placeholder="billicious@popular.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="member_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Member Name</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      id="email"
                      placeholder="billicious@popular.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form> */}
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
            placeholder="Trip to India"
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
                <span className="max-w-14 truncate md:max-w-32 lg:w-full">
                  {name}
                </span>
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
        <AnimatedButton
          isLoading={isPending}
          type="submit"
          variant="default"
          className="w-full"
          onClick={createGroup}
        >
          Create Group
        </AnimatedButton>
      </CardFooter>
    </CardMotion>
  );
};

export default CreateGroupForm;
