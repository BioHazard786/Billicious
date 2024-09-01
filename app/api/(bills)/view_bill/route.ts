import { NextResponse } from "next/server";
import { getBillFromDB } from "../utils";

export const POST = async (request: Request) => {
  let bill;
  try {
    const requestData = await request.json();

    if (requestData.bill_id === undefined) {
      throw new Error("BillId is Required");
    }

    bill = await getBillFromDB(requestData);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Something went Wrong" },
      { status: 500 },
    );
  }
  return NextResponse.json(bill, { status: 200 });
};
