import { z } from "zod";
import { titleCase } from "./utils";

export const signInFormSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password must contain at least 8 character(s)" })
    .max(32, { message: "Password must contain at most 32 character(s)" }),
});

export const signUpFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must contain at least 2 character(s)" })
    .max(32, { message: "Name must contain at most 32 character(s)" })
    .transform((val) => titleCase(val)),
  username: z
    .string()
    .min(4, { message: "Username must contain at least 4 character(s)" })
    .max(12, { message: "Username must contain at most 12 character(s)" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message:
        "Username can only contain alphanumeric characters and underscores",
    })
    .refine((username) => !/\s/.test(username), {
      message: "Username cannot contain spaces",
    })
    .transform((username) => username.trim().toLowerCase()),
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password must contain at least 8 character(s)" })
    .max(32, { message: "Password must contain at most 32 character(s)" }),
});

export const addMemberFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must contain at least 2 character(s)" })
    .max(32, { message: "Name must contain at most 32 character(s)" })
    .transform((val) => titleCase(val)),
});

export const createGroupFormSchema = z.object({
  group_name: z
    .string()
    .min(2, { message: "Group Name must contain at least 2 character(s)" })
    .max(32, { message: "Group Name must contain at most 32 character(s)" })
    .transform((val) => titleCase(val)),
  member_name: z.string().optional(),
});

export const avatarUploadSchema = z.object({
  userId: z.string(),
  image: z.instanceof(File),
});

export const profileUpdateFormSchema = z.object({
  userId: z.string().optional(),
  name: z
    .string()
    .min(2, { message: "Name must contain at least 2 character(s)" })
    .max(32, { message: "Name must contain at most 32 character(s)" })
    .transform((val) => titleCase(val)),
  username: z
    .string()
    .min(4, { message: "Username must contain at least 4 character(s)" })
    .max(12, { message: "Username must contain at most 12 character(s)" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message:
        "Username can only contain alphanumeric characters and underscores",
    })
    .refine((username) => !/\s/.test(username), {
      message: "Username cannot contain spaces",
    })
    .transform((username) => username.trim().toLowerCase()),
});
