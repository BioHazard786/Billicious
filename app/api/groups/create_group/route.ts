import { client, db } from "@/database/dbConnect";
import { groupsTable } from "@/database/schema";
import { NextResponse } from "next/server";
import { addUsersInDB, createGroupInDB } from "../utils";

export const POST = async (request: Request) => {
  let groupId;
  try {
    const requestData = await request.json();
    groupId = await createGroupInDB(requestData);
    let requestCopy = {
      ...requestData,
      group_id: groupId,
    };
    await addUsersInDB(requestCopy);
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 400 });
  }
  return NextResponse.json({ groupId: groupId }, { status: 201 });
};
