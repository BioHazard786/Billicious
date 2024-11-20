import { useAppleDevice } from "@/hooks/use-apple-device";
import { createAddMemberFormSchema } from "@/lib/schema";
import { formatMemberData } from "@/lib/utils";
import { addMembersToGroupInDB } from "@/server/fetchHelpers";
import useMemberTabStore from "@/store/add-member-tab-store";
import useDashboardStore from "@/store/dashboard-store";
import useUserInfoStore from "@/store/user-info-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Dispatch, SetStateAction, useMemo } from "react";
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
import { Input, InputWithLimit } from "../ui/input";

const AddTemporaryMember = ({
  setIsOpen,
}: {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { slug } = useParams();
  const members = useDashboardStore((state) => state.members);
  const updateMembers = useDashboardStore((state) => state.addMember);
  const { isAppleDevice: isApple } = useAppleDevice();
  const admin = useUserInfoStore((state) => state.user);
  const resetSelectedTab = useMemberTabStore.use.reset();

  const addMemberFormSchema = useMemo(
    () => createAddMemberFormSchema(members),
    [members],
  );

  const form = useForm<z.infer<typeof addMemberFormSchema>>({
    resolver: zodResolver(addMemberFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const { isPending, mutate: server_addMembersToGroup } = useMutation({
    mutationFn: addMembersToGroupInDB,
    onMutate: (variables) => {
      const toastId = toast.loading(`Adding ${variables.members![0]}...`);
      return { toastId };
    },
    onSuccess: (data, variables, context) => {
      const newMember = formatMemberData(data);
      updateMembers(newMember);
      form.reset();
      return toast.success(`${variables.members![0]} added successfully`, {
        id: context.toastId,
      });
    },
    onError: (error, variables, context) => {
      console.log(error);
      return toast.error(error.message, {
        id: context?.toastId,
      });
    },
    onSettled: () => {
      setIsOpen(false);
      resetSelectedTab();
    },
  });

  const addMembersToGroup = async (
    data: z.infer<typeof addMemberFormSchema>,
  ) => {
    // if (members.some((member) => member.name === data.name)) {
    //   return form.setError("name", { message: "Member already exists" });
    // }
    server_addMembersToGroup({
      groupId: slug as string,
      members: [data.name],
      userId: admin?.id as string,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(addMembersToGroup)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  className={isApple ? "text-base" : ""}
                  autoComplete="name"
                  id="name"
                  placeholder="Zaid"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <AnimatedButton
          isLoading={isPending}
          variant="default"
          className="w-full"
        >
          Add
        </AnimatedButton>
      </form>
    </Form>
  );
};

export default AddTemporaryMember;
