import { z } from "zod";

export const signInFormSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password must contain at least 8 character(s)" })
    .max(32, { message: "Password must contain at most 32 character(s)" }),
});

export const signUpFormSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: "Name must contain at least 2 character(s)" })
    .max(32, { message: "Name must contain at most 32 character(s)" }),
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password must contain at least 8 character(s)" })
    .max(32, { message: "Password must contain at most 32 character(s)" }),
});

export const addMemberFormSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: "Name must contain at least 2 character(s)" })
    .max(32, { message: "Name must contain at most 32 character(s)" }),
});

export const createGroupFormSchema = z.object({
  group_name: z
    .string()
    .min(2, { message: "Group Name must contain at least 2 character(s)" })
    .max(32, { message: "Group Name must contain at most 32 character(s)" }),
  member_name: z
    .string()
    .min(2, { message: "Group Name must contain at least 2 character(s)" })
    .max(32, { message: "Group Name must contain at most 32 character(s)" })
    .optional(),
});
