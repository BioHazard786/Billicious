import { db } from "@/database/dbConnect";
import { NextResponse } from "next/server";
import { getUserGroupsFromDB } from "../utils";

export const POST = async (request: Request) => {
  let groups;
  try {
    const requestData = await request.json();
    if (requestData.userId === undefined) {
      throw new Error("User Id is undefined");
    }

    await db.transaction(async (transaction) => {
      groups = await getUserGroupsFromDB(transaction, requestData.userId);
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

  return NextResponse.json({ groups }, { status: 201 });
};
