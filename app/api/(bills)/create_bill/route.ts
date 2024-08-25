import { NextResponse } from "next/server";
import { createBillInDB } from "../utils";

export const POST = async (request: Request) => {
  let billId;
  try {
    const requestData = await request.json();
    billId = await createBillInDB(requestData);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "Something went Wrong" },
      { status: 400 },
    );
  }
  return NextResponse.json({ billId: billId }, { status: 201 });
};
