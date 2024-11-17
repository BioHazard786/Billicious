import { createClient } from "@/auth-utils/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();

  try {
    const { username } = await request.json();

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Invalid username provided" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("users_table")
      .select("name, username, avatar_url, id")
      .textSearch("username", username, {
        type: "plain",
        config: "english",
      })
      .limit(10);

    if (error) throw error;

    return NextResponse.json({ results: data }, { status: 200 });
  } catch (error) {
    console.error("Username search error:", error);

    return NextResponse.json(
      { error: "Failed to search username" },
      { status: 500 },
    );
  }
}
