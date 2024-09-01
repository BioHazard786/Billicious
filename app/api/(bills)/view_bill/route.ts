import { NextResponse } from "next/server";
import { getBillFromDB } from "../utils";

export const POST = async (request: Request) => {
  let bill;
  try {
    const requestData = await request.json();
    bill = await getBillFromDB(requestData);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "Something went Wrong" },
      { status: 400 },
    );
  }
  return NextResponse.json({ bill }, { status: 200 });
};
