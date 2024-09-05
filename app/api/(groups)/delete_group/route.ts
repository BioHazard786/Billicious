import { NextResponse } from "next/server";
import { deleteGroupInDB } from "../utils";

export const DELETE = async (request: Request) => {
  let groupId;
  try {
    const requestData = await request.json();

    if (requestData.group_id === undefined) {
      throw new Error("Group Id is Required");
    }

    groupId = await deleteGroupInDB(requestData);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Something went Wrong" },
      { status: 500 },
    );
  }
  return NextResponse.json(
    { groupId: groupId + " is Deleted." },
    { status: 200 },
  );
};
