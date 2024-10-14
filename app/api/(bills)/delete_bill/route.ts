import { NextResponse } from "next/server";
import { deleteBillInDB } from "../utils";
import { db } from "@/database/dbConnect";

export const DELETE = async (request: Request) => {
  let bill;
  try {
    const requestData = await request.json();

    if (requestData.billId === undefined) {
      throw new Error("BillId is Required");
    }

    await db.transaction(async (transaction) => {
      bill = await deleteBillInDB(transaction, requestData.billId);
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
  return NextResponse.json({ bill }, { status: 200 });
};
