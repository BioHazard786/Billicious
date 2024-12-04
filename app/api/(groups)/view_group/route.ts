import { db } from "@/database/dbConnect";
import { NextResponse } from "next/server";
import {
  addUserInfoToMembers,
  getGroupFromDB,
  getMembersFromDB,
  getUserInfoForMembers,
} from "../utils";

export const POST = async (request: Request) => {
  try {
    const { groupId } = await request.json();

    if (!groupId) {
      throw new Error("Group Id is Required");
    }

    const group = await db.transaction(async (transaction) => {
      const groupData = await getGroupFromDB(transaction, groupId);
      const members = await getMembersFromDB(transaction, groupId);
      const allUserInfo = await getUserInfoForMembers(transaction, members);
      const membersWithInfo = await addUserInfoToMembers(
        transaction,
        members,
        allUserInfo,
      );

      return { group: groupData, members: membersWithInfo };
    });

    return NextResponse.json(group, { status: 200 });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json(
      { error: errorMessage },
      { status: err instanceof Error ? 400 : 500 },
    );
  }
};
