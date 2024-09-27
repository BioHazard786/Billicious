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
    .select(`id, full_name, avatar_url, email`)
    .eq("id", authUser?.id)
    .single();

  if (!dbUser) return null;

  return dbUser.data;
};

export async function signInUsingEmail(data: z.infer<typeof signInFormSchema>) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    throw error;
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUpUsingEmail(data: z.infer<typeof signUpFormSchema>) {
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      data: {
        full_name: data.full_name,
      },
    },
  });

  if (error) {
    throw error;
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signInUsingGoogle() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:3000/auth/callback",
    },
  });

  if (error) {
    throw error;
  }

  if (data.url) {
    redirect(data.url);
  }
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
