import { NextResponse } from "next/server";
import { getGroupBillsFromDB } from "../utils";
import { db } from "@/database/dbConnect";

export const POST = async (request: Request) => {
  let bills;
  try {
    const requestData = await request.json();

    if (requestData.groupId === undefined) {
      throw new Error("Group Id is Required");
    }
    await db.transaction(async (transaction) => {
      bills = await getGroupBillsFromDB(
        transaction,
        requestData.groupId,
        requestData.hasOwnProperty("pageSize") ? requestData.pageSize : 10,
        requestData.hasOwnProperty("page") ? requestData.page : 1,
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
  return NextResponse.json(bills, { status: 200 });
};
