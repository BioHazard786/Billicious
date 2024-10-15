import { db } from "@/database/dbConnect";
import { NextResponse } from "next/server";
import { getAllBalancesFromDB } from "../utils";

export const POST = async (request: Request) => {
  let balances;
  try {
    const requestData = await request.json();

    if (requestData.groupId === undefined) {
      throw new Error("Group Id is Required");
    }

    await db.transaction(async (transaction) => {
      balances = await getAllBalancesFromDB(transaction, requestData.groupId);
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
  return NextResponse.json(balances, { status: 200 });
};
