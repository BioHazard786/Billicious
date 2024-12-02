import { db } from "@/database/dbConnect";
import { NextResponse } from "next/server";
import { getAllBalancesFromDB } from "../utils";

export const POST = async (request: Request) => {
  try {
    const { groupId } = await request.json();

    if (!groupId) {
      throw new Error("Group Id is Required");
    }

    const balances = await db.transaction((transaction) =>
      getAllBalancesFromDB(transaction, groupId),
    );

    return NextResponse.json(balances, { status: 200 });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Something went wrong";
    const statusCode = err instanceof Error ? 400 : 500;
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
};
