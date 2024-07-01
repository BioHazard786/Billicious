import { z } from "zod";

export const CreateGroupFormSchema = z.object({
  groupName: z.string().min(2, {
    message: "Group name must be at least 2 characters.",
  }),
  members: z.string().min(2, {
    message: "Member name must be at least 2 characters.",
  }),
});
