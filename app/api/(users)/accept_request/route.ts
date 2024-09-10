import { NextResponse } from "next/server";
import { acceptRequest } from "../utils";

export const POST = async (request: Request) => {
  let user;
  try {
    const requestData = await request.json();
    if (requestData.user_id === undefined) {
      throw new Error("user id is required");
    }
    if (requestData.group_id === undefined) {
      throw new Error("group id is required");
    }
    await acceptRequest(requestData);
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
