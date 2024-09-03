import { client, db } from "@/database/dbConnect";
import { usersTable } from "@/database/schema";
import { and, eq } from "drizzle-orm";

export async function addUsersInDB(requestData: any) {
  let user: any = {};
  await db.transaction(async (transaction) => {
    const newUser = {
      name: requestData.name,
      username: requestData.username,
      platform: requestData.platform,
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
      .where(
        and(
          eq(usersTable.id, requestData.user_id),
          eq(usersTable.platform, requestData.platform),
        ),
      );
    if (users.length === 0) {
      throw new Error("Invalid UserId or Platform");
    }
    user = users[0];
  });
  return user;
}
