import { db } from "@/database/dbConnect";
import { NextResponse } from "next/server";
import { getUserFromDBViaUsername } from "../utils";

export const POST = async (request: Request) => {
  let user;
  try {
    const requestData = await request.json();
    if (requestData.username === undefined) {
      throw new Error("User Id is undefined");
    }
    await db.transaction(async (transaction) => {
      user = await getUserFromDBViaUsername(transaction, requestData.username);
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

  return NextResponse.json({ user }, { status: 201 });
};
