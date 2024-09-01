import { NextResponse } from "next/server";
import { getMembersFromDB } from "../utils";

export const POST = async (request: Request) => {
  let members;
  try {
    const requestData = await request.json();
    members = await getMembersFromDB(requestData);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Something went Wrong" },
      { status: 400 },
    );
  }
  return NextResponse.json(members, { status: 200 });
};
