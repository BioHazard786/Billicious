"use client";

import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppleDevice } from "@/hooks/use-apple-device";
import { createGroupFormSchema } from "@/lib/schema";
import { titleCase } from "@/lib/utils";
import { createGroupInDB } from "@/server/fetchHelpers";
import useCreateGroup from "@/store/create-group-store";
import useUserStore from "@/store/user-info-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback } from "react";
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

const CreateGroupForm: React.FC = () => {
  const form = useForm<z.infer<typeof createGroupFormSchema>>({
    resolver: zodResolver(createGroupFormSchema),
    defaultValues: {
      group_name: "",
      member_name: "",
    },
  });

  const isApple = useAppleDevice().isAppleDevice;
  const memberNames = useCreateGroup.use.memberNames();
  const addMemberName = useCreateGroup.use.addMemberName();
  const removeMemberName = useCreateGroup.use.removeMemberName();
  const reset = useCreateGroup.use.reset();
  const admin = useUserStore((state) => state.user);

  const router = useRouter();

  const addMembers = useCallback(() => {
    const memberName = form.getValues("member_name");
    if (!memberName || memberName.length < 2) {
      return form.setError("member_name", {
        type: "minLength",
        message: "Name must contain at least 2 character(s)",
      });
    }

    if (memberName.length > 32) {
      form.setError("member_name", {
        type: "maxLength",
        message: "Name must contain at most 32 character(s)",
      });
      return form.setValue("member_name", "");
    }

    if (admin?.name.toLowerCase() === memberName.toLowerCase()) {
      form.setError("member_name", {
        type: "deps",
        message: "This member is admin",
      });
      return form.setValue("member_name", "");
    }

    if (
      memberNames.some(
        (name) => name.toLowerCase() === memberName.toLowerCase(),
      )
    ) {
      form.setError("member_name", {
        type: "deps",
        message: "Name already exists",
      });
      return form.setValue("member_name", "");
    }

    addMemberName(titleCase(memberName));
    form.resetField("member_name");
  }, [form, memberNames, addMemberName]);

  const { isPending, mutate: server_createGroup } = useMutation({
    mutationFn: createGroupInDB,
    onSuccess: (data) => {
      const path = `/group/${encodeURIComponent(data.group.id)}`;
      router.replace(path);
      reset();
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message);
    },
  });

  const createGroup = useCallback(
    (data: z.infer<typeof createGroupFormSchema>) => {
      if (memberNames.length === 0) {
        return form.setError("member_name", {
          type: "manual",
          message: "Add at least 1 members",
        });
      }

      const groupBody = {
        name: data.group_name,
        members: memberNames,
        user_id: admin!.id,
      };

      server_createGroup(groupBody);
    },
    [form, memberNames, server_createGroup],
  );

  const addMemberOnKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addMembers();
      }
    },
    [addMembers],
  );

  return (
    <CardMotion layout className="mx-4 w-[24rem] md:mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create Group</CardTitle>
        <CardDescription>
          Enter group name and members to create group
        </CardDescription>
      </CardHeader>
      <CardContentMotion layout>
        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(createGroup)}
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          >
            <FormField
              control={form.control}
              name="group_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input
                      className={isApple ? "text-base" : ""}
                      autoComplete="groupName"
                      id="groupName"
                      placeholder="Trip to India"
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
                    <div className="flex w-full items-center justify-center space-x-2">
                      <Input
                        className={isApple ? "text-base" : ""}
                        autoComplete="name"
                        id="memberName"
                        placeholder="Zaid"
                        onKeyDown={addMemberOnKeyDown}
                        {...field}
                      />
                      <Button
                        variant="default"
                        type="button"
                        size="icon"
                        onClick={addMembers}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ul className="flex flex-wrap gap-2">
              <AnimatePresence presenceAffectsLayout>
                {memberNames.map((name, index) => (
                  <MemberItem
                    key={`member-name-${index}`}
                    name={name}
                    onRemove={() => removeMemberName(name)}
                  />
                ))}
              </AnimatePresence>
            </ul>
            <AnimatedButton
              isLoading={isPending}
              type="submit"
              variant="default"
              className="w-full"
            >
              Create Group
            </AnimatedButton>
          </form>
        </Form>
      </CardContentMotion>
    </CardMotion>
  );
};

const MemberItem: React.FC<{ name: string; onRemove: () => void }> = React.memo(
  ({ name, onRemove }) => (
    <motion.li
      animate={{ opacity: 1, scale: 1 }}
      initial={{ opacity: 0, scale: 0 }}
      exit={{ opacity: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="inline-flex h-8 cursor-default items-center rounded-sm bg-secondary pl-2 text-sm text-secondary-foreground"
    >
      <span className="max-w-14 truncate md:max-w-32 lg:w-full">{name}</span>
      <button
        type="button"
        onClick={onRemove}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onRemove();
          }
        }}
        className="inline-flex h-full items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      >
        <X className="size-[0.85rem]" />
      </button>
    </motion.li>
  ),
);

MemberItem.displayName = "MemberItem";

export default CreateGroupForm;
