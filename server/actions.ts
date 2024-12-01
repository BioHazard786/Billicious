"use server";

import { createClient } from "@/auth-utils/server";
import { generateJWT } from "@/auth-utils/utils";
import {
  passwordSchema,
  signInFormSchema,
  signUpFormSchema,
} from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

export const getSession = async () => {
  const supabase = createClient();
  const authUser = (await supabase.auth.getUser()).data.user;
  if (!authUser) return null;

  return authUser;
};

export const getUser = async () => {
  const supabase = createClient();
  const authUser = await getSession();
  if (!authUser) return null;

  // fetch user from database
  const dbUser = await supabase
    .from("users_table")
    .select("id, name, avatar_url, email, username")
    .eq("id", authUser?.id)
    .single();

  if (!dbUser) return null;

  return dbUser.data;
};

export async function signInUsingEmail(
  data: z.infer<typeof signInFormSchema> & { next: string },
) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message || "Something went wrong" };
  }

  const cookieJar = cookies();
  cookieJar.set("lastSignedInMethod", "email");

  revalidatePath("/", "layout");
  redirect(data.next);
}

export async function signUpUsingEmail(data: z.infer<typeof signUpFormSchema>) {
  const supabase = createClient();
  const { data: existingUser, error: existingUserError } = await supabase
    .from("users_table")
    .select("username")
    .eq("username", data.username)
    .single();

  if (
    (existingUserError && existingUserError.code !== "PGRST116") ||
    existingUser
  ) {
    return { error: "Username not available" };
  }

  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.DOMAIN;

  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: `${baseUrl}/register/passkey`,
      data: {
        full_name: data.name,
        username: data.username,
      },
    },
  });

  if (error) {
    console.error(error);
    return { error: error.message || "Something went wrong" };
  }

  return {
    success:
      "Email verification sent. Please check your inbox, verification link expires in 10 minutes.",
  };

  // revalidatePath("/", "layout");
  // redirect("/register/passkey");
}

export async function signInUsingGoogle(next: string) {
  const supabase = createClient();
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.DOMAIN;
  const redirectUrl = `${baseUrl}/auth/callback?next=${encodeURIComponent(next)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirectUrl },
  });

  if (error) return { error: error.message || "Something went wrong" };

  const cookieJar = cookies();
  cookieJar.set("lastSignedInMethod", "google");

  if (data.url) redirect(data.url);
}

export async function signInUsingPasskey(userId: string, next: string) {
  const supabase = createClient();
  const token = generateJWT(userId);

  // Use the JWT to get a Supabase session
  const { error } = await supabase.auth.setSession({
    access_token: token,
    refresh_token: token, // In this case, it's the same as access_token
  });

  if (error) return { error: error.message || "Something went wrong" };

  const cookieJar = cookies();
  cookieJar.set("lastSignedInMethod", "passkey");

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOut() {
  const supabase = createClient();

  // Check if a user's logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  return redirect("/auth/signin");
}

export async function resetPassword(email: string) {
  const supabase = createClient();

  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.DOMAIN;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/settings/account/update-password`,
  });

  if (error) {
    console.error(error);
    return { error: error.message || "Something went wrong" };
  }

  revalidatePath("/", "layout");
  return redirect("/auth/signin");
}

export async function updatePassword(data: z.infer<typeof passwordSchema>) {
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser(data);

  if (error) {
    console.error(error);
    return { error: error.message || "Something went wrong" };
  }

  revalidatePath("/", "layout");
  return redirect("/");
}
