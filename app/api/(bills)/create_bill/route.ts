import { NextResponse } from "next/server";
import { createBillInDB } from "../utils";

export const POST = async (request: Request) => {
  let bill;
  try {
    const requestData = await request.json();

    if (requestData.group_id === undefined) {
      throw new Error("GroupId is Required");
    }
    if (requestData.name === undefined) {
      throw new Error("Bill Name is Required");
    }
    if (requestData.drawees === undefined || requestData.payees === undefined) {
      throw new Error("Drawees and Payees Required");
    }

    bill = await createBillInDB(requestData);
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
