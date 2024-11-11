import { db } from "@/database/dbConnect";
import { NextResponse } from "next/server";
import {
  addUserInfoToMembers,
  getGroupFromDB,
  getMembersFromDB,
  getUserInfoForMembers,
} from "../utils";

export const POST = async (request: Request) => {
  let group: any = {};
  try {
    const requestData = await request.json();

    if (requestData.groupId === undefined) {
      throw new Error("Group Id is Required");
    }

    await db.transaction(async (transaction) => {
      group.group = await getGroupFromDB(transaction, requestData.groupId);
      const members = await getMembersFromDB(transaction, requestData.groupId);
      const allUserInfo = await getUserInfoForMembers(transaction, members);
      group.members = await addUserInfoToMembers(
        transaction,
        members,
        allUserInfo,
      );
    });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Something went Wrong" },
      { status: 500 },
    );
  }
  return NextResponse.json(group, { status: 200 });
};
