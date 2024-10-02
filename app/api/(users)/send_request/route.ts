import { NextResponse } from "next/server";
import { sendRequest } from "../utils";

export const POST = async (request: Request) => {
  try {
    const requestData = await request.json();
    if (requestData.sender_user_id === undefined) {
      throw new Error("sender user id is required");
    }
    if (requestData.receiver_user_id === undefined) {
      throw new Error("receiver user id is required");
    }
    if (requestData.group_id === undefined) {
      throw new Error("group id is required");
    }
    if (requestData.user_index === undefined) {
      throw new Error("user index is required");
    }
    await sendRequest(requestData);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Something went Wrong" },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "Request Sent" }, { status: 201 });
};
