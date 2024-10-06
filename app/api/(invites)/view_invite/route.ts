import { NextResponse } from "next/server";
import { getInvitesFromDB } from "../utils";

export const POST = async (request: Request) => {
  let invite;
  try {
    const requestData = await request.json();
    if (
      requestData.user_id === undefined &&
      requestData.group_id === undefined
    ) {
      throw new Error("at least user or group id is required");
    }
    invite = await getInvitesFromDB(requestData);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Something went Wrong" },
      { status: 500 },
    );
  }

  return NextResponse.json({ invite }, { status: 201 });
};
