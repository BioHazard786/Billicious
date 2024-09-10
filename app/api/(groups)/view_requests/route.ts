import { NextResponse } from "next/server";
import { getRequestFromDB } from "../utils";

export const POST = async (request: Request) => {
  let groupRequests;
  try {
    const requestData = await request.json();

    if (requestData.group_id === undefined) {
      throw new Error("Group Id is Required");
    }

    groupRequests = await getRequestFromDB(requestData);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Something went Wrong" },
      { status: 500 },
    );
  }
  return NextResponse.json(groupRequests, { status: 200 });
};
