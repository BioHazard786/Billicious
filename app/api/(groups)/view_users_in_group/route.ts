import { NextResponse } from "next/server";
import { getUsersFromDB } from "../utils";

export const POST = async (request: Request) => {
  let users;
  try {
    const requestData = await request.json();
    users = await getUsersFromDB(requestData);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "Something went Wrong" },
      { status: 400 },
    );
  }
  return NextResponse.json({ users: users }, { status: 201 });
};
