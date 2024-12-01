import { z } from "zod";
import { TMembers } from "./types";
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
    .max(16, { message: "Username must contain at most 12 character(s)" })
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
    .min(8, "Password must be at least 8 characters")
    .max(32, { message: "Password must contain at most 32 character(s)" })
    .regex(/[A-Z]/, "Password must include at least 1 uppercase letter")
    .regex(/[a-z]/, "Password must include at least 1 lowercase letter")
    .regex(/[0-9]/, "Password must include at least 1 number"),
});

export const createAddMemberFormSchema = (members: TMembers[]) =>
  z.object({
    name: z
      .string()
      .min(2, { message: "Name must contain at least 2 character(s)" })
      .max(32, { message: "Name must contain at most 32 character(s)" })
      .transform((name) => titleCase(name))
      .refine((name) => !members.some((member) => member.name === name), {
        message: "Member already exists",
      }),
  });

export const createGroupFormSchema = z.object({
  group_name: z
    .string()
    .min(2, { message: "Group Name must contain at least 2 character(s)" })
    .max(32, { message: "Group Name must contain at most 32 character(s)" })
    .transform((name) => titleCase(name)),
  permanent_member_name: z.string().optional(),
  temporary_member_name: z.string().optional(),
});

export const groupNameTabFormSchema = z.object({
  group_name: z
    .string()
    .min(2, { message: "Group Name must contain at least 2 character(s)" })
    .max(32, { message: "Group Name must contain at most 32 character(s)" })
    .transform((val) => titleCase(val)),
  currency: z.string(),
});
export const avatarUploadSchema = z.object({
  userId: z.string(),
  image: z.instanceof(File),
});

export const profileUpdateFormSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email(),
  name: z
    .string()
    .min(2, { message: "Name must contain at least 2 character(s)" })
    .max(32, { message: "Name must contain at most 32 character(s)" })
    .transform((val) => titleCase(val)),
  username: z
    .string()
    .min(4, { message: "Username must contain at least 4 character(s)" })
    .max(16, { message: "Username must contain at most 12 character(s)" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message:
        "Username can only contain alphanumeric characters and underscores",
    })
    .refine((username) => !/\s/.test(username), {
      message: "Username cannot contain spaces",
    })
    .transform((username) => username.trim().toLowerCase()),
});

export const passwordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, { message: "Password must contain at most 32 character(s)" })
    .regex(/[A-Z]/, "Password must include at least 1 uppercase letter")
    .regex(/[a-z]/, "Password must include at least 1 lowercase letter")
    .regex(/[0-9]/, "Password must include at least 1 number"),
});
