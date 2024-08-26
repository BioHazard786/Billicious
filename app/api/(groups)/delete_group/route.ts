import { NextResponse } from "next/server";
import { deleteGroupInDB } from "../utils";

export const DELETE = async (request: Request) => {
  let groupId;
  try {
    const requestData = await request.json();
    groupId = await deleteGroupInDB(requestData);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "Something went Wrong" },
      { status: 400 },
    );
  }
  return NextResponse.json(
    { groupId: groupId + " is Deleted." },
    { status: 201 },
  );
};
