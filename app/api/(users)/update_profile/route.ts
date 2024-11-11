import { createClient } from "@/auth-utils/server";
import { profileUpdateFormSchema } from "@/lib/schema";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  const supabase = createClient();

  try {
    const { userId, name, username } = profileUpdateFormSchema.parse(
      await request.json(),
    );

    // Check for unique username
    const { data: existingUser, error: existingUserError } = await supabase
      .from("users_table")
      .select("id")
      .eq("username", username)
      .neq("id", userId) // Exclude the current user
      .single();

    if (
      (existingUserError && existingUserError.code !== "PGRST116") ||
      existingUser
    ) {
      return NextResponse.json(
        { error: "Username not available" },
        { status: 409 }, // Conflict status code
      );
    }

    // Update profiles
    const { error: updateError } = await supabase
      .from("users_table")
      .update({ name, username })
      .eq("id", userId);

    if (updateError) throw updateError;

    return NextResponse.json(
      { message: "Profile updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Profile update error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
