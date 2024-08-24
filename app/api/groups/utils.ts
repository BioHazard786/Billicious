import { client, db } from "@/database/dbConnect";
import { usersGroupsTable, groupsTable } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function createGroupInDB(requestData: any) {
  let groupId;
  await db.transaction(async (transaction) => {
    const newGroup = {
      name: requestData.name,
    };

    groupId = await transaction
      .insert(groupsTable)
      .values(newGroup)
      .returning({ id: groupsTable.id });
  });

  return groupId;
}

export async function addUsersInDB(requestData: any) {
  await db.transaction(async (transaction) => {
    let groupId = requestData.group_id;
    let users = [];

    const usersInGroup = await transaction
      .select()
      .from(usersGroupsTable)
      .where(eq(usersGroupsTable.groupId, groupId));

    let count = usersInGroup.length === null ? 0 : usersInGroup.length;
    // console.log(requestData.users);
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
}
