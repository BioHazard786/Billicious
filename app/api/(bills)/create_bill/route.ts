import { db } from "@/database/dbConnect";
import { NextResponse } from "next/server";
import { createBillInDB } from "../utils";

export const POST = async (request: Request) => {
  try {
    const {
      groupId,
      name,
      drawees,
      payees,
      category,
      notes,
      isPayment,
      createdBy,
      createdAt = new Date(),
    } = await request.json();

    // REQUEST DATA VALIDATION
    if (!groupId) throw new Error("group id is required");
    if (!name) throw new Error("bill name is required");
    if (!drawees) throw new Error("drawees are required");
    if (!payees) throw new Error("payees are required");
    if (!category) throw new Error("category is required");
    if (createdBy === undefined) throw new Error("created by is required");

    const bill = await db.transaction(async (transaction) => {
      return await createBillInDB(
        transaction,
        groupId,
        drawees,
        payees,
        name,
        notes,
        category,
        isPayment,
        createdBy,
        new Date(createdAt),
      );
    });

    return NextResponse.json(bill, { status: 200 });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
};
