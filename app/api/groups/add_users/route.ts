import { client, db } from "@/database/dbConnect";
import { usersGroupsTable, usersTable } from "@/database/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    await db.transaction(async (transaction) => {
      const requestData = await request.json();
      let groupId = requestData.group_id;
      let users = [];

      const usersInGroup = await transaction
        .select()
        .from(usersGroupsTable)
        .where(eq(usersGroupsTable.groupId, groupId));

      let count = usersInGroup.length === null ? 0 : usersInGroup.length;
      console.log(requestData.users);
      for (let user of requestData.users) {
        users.push({
          userId: groupId + " | " + count,
          groupId: groupId,
          userNameInGroup: user,
          userIndex: count++,
          totalAmount: "0",
        });
      }

      await transaction.insert(usersGroupsTable).values(users);
    });
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 400 });
  }

  return NextResponse.json({ message: "User Added to Group" }, { status: 201 });
};
