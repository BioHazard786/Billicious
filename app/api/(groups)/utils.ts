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

export async function getGroupFromDB(requestData: any) {
  let group;
  await db.transaction(async (transaction) => {
    let groupId = requestData.group_id;
    let groups = await transaction
      .select()
      .from(groupsTable)
      .where(eq(groupsTable.id, groupId));

    if (groups.length == 0) {
      throw new Error("Invalid Group Id");
    }

    group = groups[0];
  });

  return group;
}

export async function getUsersFromDB(requestData: any) {
  let users;
  await db.transaction(async (transaction) => {
    let groupId = requestData.group_id;
    users = await transaction
      .select()
      .from(usersGroupsTable)
      .where(eq(usersGroupsTable.groupId, groupId));

    if (users.length == 0) {
      throw new Error("Invalid Group Id");
    }
  });

  return users;
}
