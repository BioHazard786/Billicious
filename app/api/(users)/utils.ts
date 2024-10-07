import { client, db } from "@/database/dbConnect";
import { membersTable, usersTable } from "@/database/schema";
import { and, eq, or } from "drizzle-orm";

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
  let groups;
  await db.transaction(async (transaction) => {
    groups = await transaction
      .select()
      .from(membersTable)
      .where(eq(membersTable.userId, requestData.user_id));

    if (groups.length === 0) {
      throw new Error("user is not a part of any group");
    }
  });
  return groups;
}
