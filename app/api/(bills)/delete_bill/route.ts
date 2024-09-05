import { NextResponse } from "next/server";
import { deleteBillInDB } from "../utils";

export const DELETE = async (request: Request) => {
  let bill;
  try {
    const requestData = await request.json();

    if (requestData.bill_id === undefined) {
      throw new Error("BillId is Required");
    }

    bill = await deleteBillInDB(requestData);
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
