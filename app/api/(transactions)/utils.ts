import { client, db } from "@/database/dbConnect";
import { transactionsTable } from "@/database/schema";
import { and, eq } from "drizzle-orm";

export async function getAllBalancesFromDB(requestData: any) {
  let balances;
  await db.transaction(async (transaction) => {
    let groupId = requestData.group_id;

    balances = await transaction
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.groupId, groupId));
  });

  return balances;
}

export async function getUserBalancesFromDB(requestData: any) {
  let balances;
  await db.transaction(async (transaction) => {
    let groupId = requestData.group_id;
    let userIndex = requestData.user_index;

    balances = await transaction
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.groupId, groupId),
          eq(transactionsTable.user1Index, userIndex),
        ),
      );
  });
  return balances;
}
