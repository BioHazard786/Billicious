import { NextResponse } from "next/server";
import { sendInvite } from "../utils";

export const POST = async (request: Request) => {
  try {
    const requestData = await request.json();
    if (requestData.sender_user_id === undefined) {
      throw new Error("sender user id is required");
    }
    if (requestData.receiver_username === undefined) {
      throw new Error("receiver user name is required");
    }
    if (requestData.group_id === undefined) {
      throw new Error("group id is required");
    }
    if (requestData.user_index === undefined) {
      throw new Error("user index is required");
    }
    await sendInvite(requestData);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Something went Wrong" },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "Invite Sent" }, { status: 201 });
};
