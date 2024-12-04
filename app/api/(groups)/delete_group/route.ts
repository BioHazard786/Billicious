import { db } from "@/database/dbConnect";
import { NextResponse } from "next/server";
import { deleteGroupInDB } from "../utils";

export const POST = async (request: Request) => {
  try {
    const { groupId } = await request.json();

    if (!groupId) {
      throw new Error("Group Id is Required");
    }

    await db.transaction(async (transaction) => {
      await deleteGroupInDB(transaction, groupId);
    });

    return NextResponse.json(
      { message: `Group ${groupId} is Deleted.` },
      { status: 200 },
    );
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Something went Wrong";
    const statusCode = err instanceof Error ? 400 : 500;
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
};
