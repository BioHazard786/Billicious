import { NextResponse } from "next/server";
import { deleteBillInDB } from "../utils";

export const DELETE = async (request: Request) => {
  let billId;
  try {
    const requestData = await request.json();
    billId = await deleteBillInDB(requestData);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "Something went Wrong" },
      { status: 400 },
    );
  }
  return NextResponse.json(
    { billId: billId + " is deleted." },
    { status: 201 },
  );
};
