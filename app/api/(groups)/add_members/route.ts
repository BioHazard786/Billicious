import { NextResponse } from "next/server";
import { addMembersInDB } from "../utils";

export const POST = async (request: Request) => {
  try {
    const requestData = await request.json();

    if (requestData.members === undefined || requestData.members.length === 0) {
      throw new Error("Members are Required");
    }

    await addMembersInDB(requestData);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Something went Wrong" },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "User Added to Group" }, { status: 200 });
};
