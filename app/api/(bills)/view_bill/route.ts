import { NextResponse } from "next/server";
import { getBillFromDB } from "../utils";
import { db } from "@/database/dbConnect";

export const POST = async (request: Request) => {
  let bill;
  try {
    const requestData = await request.json();

    if (requestData.billId === undefined) {
      throw new Error("BillId is Required");
    }

    await db.transaction(async (transaction) => {
      bill = await getBillFromDB(transaction, requestData.billId);
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
  return NextResponse.json(bill, { status: 200 });
};
