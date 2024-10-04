"use server";

import { createClient } from "@/auth-utils/server";
import { signInFormSchema, signUpFormSchema } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export const getUser = async () => {
  const supabase = createClient();
  const authUser = (await supabase.auth.getUser()).data.user;
  if (!authUser) return null;

  // fetch user from database
  const dbUser = await supabase
    .from("profiles")
    .select(`id, name, avatar_url, email, username`)
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

  revalidatePath("/", "layout");
  redirect(data.next);
}

export async function signUpUsingEmail(data: z.infer<typeof signUpFormSchema>) {
  const supabase = createClient();
  const { data: existingUser, error: existingUserError } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", data.username)
    .single();

  if (
    (existingUserError && existingUserError.code !== "PGRST116") ||
    existingUser
  ) {
    return { error: "Username not available" };
  }

  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      data: {
        full_name: data.name,
        username: data.username,
      },
    },
  });

  if (error) {
    console.log(error);
    return { error: error.message || "Something went wrong" };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signInUsingGoogle(next: string) {
  const supabase = createClient();
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://app-billicious.vercel.app";
  const redirectUrl = `${baseUrl}/auth/callback?next=${encodeURIComponent(next)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirectUrl },
  });

  if (error) return { error: error.message || "Something went wrong" };
  if (data.url) redirect(data.url);
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
