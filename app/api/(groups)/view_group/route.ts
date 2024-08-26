import { NextResponse } from "next/server";
import { getGroupFromDB } from "../utils";

export const POST = async (request: Request) => {
  let group;
  try {
    const requestData = await request.json();
    group = await getGroupFromDB(requestData);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "Something went Wrong" },
      { status: 400 },
    );
  }
  return NextResponse.json({ group: group }, { status: 201 });
};
