import { NextResponse } from "next/server";
import { getGroupInvitesFromDB } from "../utils";
import { db } from "@/database/dbConnect";

export const POST = async (request: Request) => {
  let invites: any = [];
  try {
    const requestData = await request.json();
    if (requestData.groupId === undefined) {
      throw new Error("group id is required");
    }
    await db.transaction(async (transaction) => {
      invites = await getGroupInvitesFromDB(transaction, requestData.groupId);
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
