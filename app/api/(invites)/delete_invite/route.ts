import { NextResponse } from "next/server";
import { deleteInvite } from "../utils";

export const POST = async (request: Request) => {
  try {
    const requestData = await request.json();
    if (requestData.user_index === undefined) {
      throw new Error("user index is required");
    }
    if (requestData.group_id === undefined) {
      throw new Error("group id is required");
    }
    if (requestData.user_id === undefined) {
      throw new Error("user id is required");
    }
    await deleteInvite(requestData);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Something went Wrong" },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "Invite Deleted" }, { status: 201 });
};
