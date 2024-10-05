import { NextResponse } from "next/server";
import { addMembersInDB } from "../utils";

export const POST = async (request: Request) => {
  let members = [];
  try {
    const requestData = await request.json();
    if (requestData.members === undefined || requestData.members.length === 0) {
      throw new Error("Members are Required");
    }

    members = await addMembersInDB(requestData, false, {});
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Something went Wrong" },
      { status: 500 },
    );
  }

  return NextResponse.json(members, { status: 200 });
};
