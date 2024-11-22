import { db } from "@/database/dbConnect";
import { NextResponse } from "next/server";
import { getUserInvitesFromDB } from "../utils";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "user id is required" },
        { status: 400 },
      );
    }

    const invites = await db.transaction(async (transaction) =>
      getUserInvitesFromDB(transaction, userId),
    );

    return NextResponse.json({ invites }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong" },
      { status: err instanceof Error ? 400 : 500 },
    );
  }
}
