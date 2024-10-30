import { NextResponse } from "next/server";
import { getUserInvitesFromDB } from "../utils";
import { db } from "@/database/dbConnect";

export const POST = async (request: Request) => {
  let invites: any = [];
  try {
    const requestData = await request.json();
    if (requestData.userId === undefined) {
      throw new Error("user id is required");
    }
    await db.transaction(async (transaction) => {
      invites = await getUserInvitesFromDB(transaction, requestData.userId);
    });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Something went Wrong" },
      { status: 500 },
    );
  }

  return NextResponse.json({ invites }, { status: 201 });
};
