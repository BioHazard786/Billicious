import { NextResponse } from "next/server";
import { createBillInDB } from "../utils";
import { db } from "@/database/dbConnect";

export const POST = async (request: Request) => {
  let bill;
  try {
    const requestData = await request.json();

    // REQUEST DATA VALIDATION
    if (requestData.groupId === undefined) {
      throw new Error("group id is required");
    }
    if (requestData.name === undefined) {
      throw new Error("bill name is required");
    }
    if (requestData.drawees === undefined) {
      throw new Error("drawees are required");
    }
    if (requestData.payees === undefined) {
      throw new Error("payees are required");
    }
    if (requestData.category === undefined) {
      throw new Error("category is required");
    }

    await db.transaction(async (transaction) => {
      bill = await createBillInDB(
        transaction,
        requestData.groupId,
        requestData.drawees,
        requestData.payees,
        requestData.name,
        requestData.notes,
        requestData.category,
        requestData.isPayment === undefined ? false : requestData.isPayment,
        requestData.createdAt === undefined
          ? new Date()
          : new Date(requestData.createdAt),
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
  return NextResponse.json(bill, { status: 200 });
};
