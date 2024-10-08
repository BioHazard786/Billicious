import { client, db } from "@/database/dbConnect";
import { groupsTable, membersTable, usersTable } from "@/database/schema";
import { and, eq, or, inArray } from "drizzle-orm";

export async function addUsersInDB(requestData: any) {
  let user: any = {};
  await db.transaction(async (transaction) => {
    const newUser = {
      id: requestData.id,
      name: requestData.name,
      username: requestData.username,
    };

    user = await transaction.insert(usersTable).values(newUser).returning();
  });
  return user;
}

export async function getUserFromDB(requestData: any) {
  let user: any = {};
  await db.transaction(async (transaction) => {
    let users = await transaction
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, requestData.user_id));
    if (users.length === 0) {
      throw new Error("Invalid UserId");
    }
    user = users[0];
  });
  return user;
}

export async function getUserGroupsFromDB(requestData: any) {
  let userGroups: any = [];
  await db.transaction(async (transaction) => {
    let groups = await transaction
      .select()
      .from(membersTable)
      .where(eq(membersTable.userId, requestData.user_id));

    if (groups.length === 0) {
      return groups;
    }

    let groupIds = groups.map((group) => group.groupId!);
    // console.log(userIds);

    let groupInfo = await transaction
      .select()
      .from(groupsTable)
      .where(inArray(groupsTable.id, groupIds));
    // console.log(userInfo);

    let groupInfoMap = new Map();
    for (let group of groupInfo) {
      groupInfoMap.set(group.id, group.name);
    }

    for (let group of groups) {
      let groupName = groupInfoMap.get(group.groupId);
      if (groupName !== undefined) {
        userGroups.push({
          ...group,
          groupName: groupName,
        });
      } else {
        userGroups.push({
          ...group,
          groupName: null,
        });
      }
    }
  });
  return userGroups;
}
