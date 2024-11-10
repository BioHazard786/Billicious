import { NextResponse } from "next/server";
import { deleteInvite } from "../utils";
import { db } from "@/database/dbConnect";

export const POST = async (request: Request) => {
  try {
    const requestData = await request.json();
    if (requestData.groupId === undefined) {
      throw new Error("group id is required");
    }
    if (requestData.userId === undefined) {
      throw new Error("user id is required");
    }
    if (requestData.userIndex === undefined) {
      throw new Error("user index is required");
    }
    await db.transaction(async (transaction) => {
      await deleteInvite(
        transaction,
        requestData.groupId,
        requestData.userId,
        requestData.userIndex,
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

  return NextResponse.json({ message: "Invite Deleted" }, { status: 201 });
};
