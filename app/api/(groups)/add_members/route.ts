import { NextResponse } from "next/server";
import { addMembersInDB } from "../utils";

export const POST = async (request: Request) => {
  try {
    const requestData = await request.json();
    await addMembersInDB(requestData);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "Something went Wrong" },
      { status: 400 },
    );
  }

  return NextResponse.json({ message: "User Added to Group" }, { status: 200 });
};
