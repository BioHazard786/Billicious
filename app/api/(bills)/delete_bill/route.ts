import { db } from "@/database/dbConnect";
import { NextResponse } from "next/server";
import { deleteBillInDB } from "../utils";

export const POST = async (request: Request) => {
  try {
    const { billId } = await request.json();

    if (!billId) {
      return NextResponse.json(
        { error: "BillId is Required" },
        { status: 400 },
      );
    }

    const bill = await db.transaction(async (transaction) => {
      return await deleteBillInDB(transaction, billId);
    });

    return NextResponse.json(bill, { status: 200 });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Something went Wrong";
    const statusCode = err instanceof Error ? 400 : 500;
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
};
