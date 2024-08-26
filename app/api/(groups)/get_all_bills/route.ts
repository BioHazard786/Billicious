import { NextResponse } from "next/server";
import { getGroupBillsFromDB } from "../utils";

export const POST = async (request: Request) => {
  let bills;
  try {
    const requestData = await request.json();
    bills = await getGroupBillsFromDB(requestData);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "Something went Wrong" },
      { status: 400 },
    );
  }
  return NextResponse.json({ bills: bills }, { status: 201 });
};
