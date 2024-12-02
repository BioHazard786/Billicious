import { db } from "@/database/dbConnect";
import { NextResponse } from "next/server";
import { getGroupBillsFromDB } from "../utils";

export const POST = async (request: Request) => {
  try {
    const { groupId, pageSize = 10, page = 1, from, to } = await request.json();

    if (!groupId) {
      throw new Error("Group Id is Required");
    }

    const bills = await db.transaction((transaction) =>
      getGroupBillsFromDB(transaction, groupId, pageSize, page, from, to),
    );

    return NextResponse.json(bills, { status: 200 });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Something went wrong";
    const statusCode = err instanceof Error ? 400 : 500;
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
};
