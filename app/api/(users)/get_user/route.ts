import { NextResponse } from "next/server";
import { getUserFromDB } from "../utils";

export const POST = async (request: Request) => {
  let user;
  try {
    const requestData = await request.json();
    if (requestData.user_id !== undefined) {
      throw new Error("User Id is undefined");
    }
    if (requestData.platform !== undefined) {
      throw new Error("Platform is undefined");
    }
    user = await getUserFromDB(requestData);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Something went Wrong" },
      { status: 500 },
    );
  }

  return NextResponse.json({ user }, { status: 201 });
};
