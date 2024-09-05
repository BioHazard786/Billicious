import { NextResponse } from "next/server";
import { getGroupBillsFromDB } from "../utils";

export const POST = async (request: Request) => {
  let bills;
  try {
    const requestData = await request.json();

    if (requestData.group_id === undefined) {
      throw new Error("Group Id is Required");
    }

    bills = await getGroupBillsFromDB(requestData);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Something went Wrong" },
      { status: 500 },
    );
  }
  return NextResponse.json(bills, { status: 200 });
};
