import { client, db } from "@/database/dbConnect";
import { transactionsTable } from "@/database/schema";
import { and, eq, ExtractTablesWithRelations } from "drizzle-orm";
import { PgTransaction } from "drizzle-orm/pg-core";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";

export async function getAllBalancesFromDB(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  groupId: string,
) {
  let balances = await transaction
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.groupId, groupId));

  balances = balances.filter((balance) => {
    return parseFloat(balance.balance) > 0;
  });

  return balances;
}

export async function getUserBalancesFromDB(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  groupId: string,
  userIndex: number,
) {
  let balances = await transaction
    .select()
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.groupId, groupId),
        eq(transactionsTable.user1Index, userIndex),
      ),
    );
  return balances;
}
