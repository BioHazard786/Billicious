import { db } from "@/database/dbConnect";
import { NextResponse } from "next/server";
import { getUserGroupsFromDB } from "../utils";

export const POST = async (request: Request) => {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json(
        { error: "User Id is undefined" },
        { status: 400 },
      );
    }

    const groups = await db.transaction(async (transaction) => {
      return await getUserGroupsFromDB(transaction, userId);
    });

    return NextResponse.json({ groups }, { status: 201 });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Something went wrong";
    const statusCode = err instanceof Error ? 400 : 500;
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
};
