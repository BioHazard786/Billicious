import { NextResponse } from "next/server";
import {
  getMembersFromDB,
  getUserInfoForMembers,
  addUserInfoToMembers,
} from "../utils";
import { db } from "@/database/dbConnect";

export const POST = async (request: Request) => {
  let members;
  try {
    const requestData = await request.json();

    if (requestData.groupId === undefined) {
      throw new Error("Group Id is Required");
    }

    await db.transaction(async (transaction) => {
      members = await getMembersFromDB(transaction, requestData.groupId);
      let allUserInfo = await getUserInfoForMembers(transaction, members);
      members = await addUserInfoToMembers(transaction, members, allUserInfo);
    });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Something went Wrong" },
      { status: 500 },
    );
  }
  return NextResponse.json(members, { status: 200 });
};
