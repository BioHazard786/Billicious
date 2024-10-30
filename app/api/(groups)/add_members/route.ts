import { NextResponse } from "next/server";
import { addMembersInDB } from "../utils";
import { db } from "@/database/dbConnect";

export const POST = async (request: Request) => {
  let members: any = [];
  try {
    const requestData = await request.json();
    if (
      (requestData.members === undefined || requestData.members.length === 0) &&
      (requestData.usernames === undefined ||
        requestData.usernames.length === 0)
    ) {
      throw new Error("Members or Usernames are required");
    }
    if (requestData.groupId === undefined) {
      throw new Error("GroupId is required");
    }
    if (requestData.userId === undefined) {
      throw new Error("user Id is required");
    }

    await db.transaction(async (transaction) => {
      members = await addMembersInDB(
        transaction,
        requestData.groupId,
        false,
        requestData.userId,
        requestData.members,
        requestData.usernames,
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

  return NextResponse.json(members, { status: 200 });
};
