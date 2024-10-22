import { NextResponse } from "next/server";
import { getInvitesFromDB } from "../utils";
import { db } from "@/database/dbConnect";

export const POST = async (request: Request) => {
  let invites;
  try {
    const requestData = await request.json();
    if (
      (requestData.userId === undefined && requestData.groupId === undefined) ||
      (requestData.userId !== undefined && requestData.groupId !== undefined)
    ) {
      throw new Error("at least user or group id is required");
    }
    db.transaction(async (transaction) => {
      invites = await getInvitesFromDB(
        transaction,
        requestData.userId,
        requestData.groupId,
      );
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
