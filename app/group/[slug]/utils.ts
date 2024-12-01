import {
  addUserInfoToMembers,
  getGroupBillsFromDB,
  getGroupFromDB,
  getMembersFromDB,
  getUserInfoForMembers,
} from "@/app/api/(groups)/utils";
import { createClient } from "@/auth-utils/server";
import { db } from "@/database/dbConnect";
import { TGroupData } from "@/lib/types";
import { formatGroupData } from "@/lib/utils";
import { ExtractTablesWithRelations } from "drizzle-orm";
import { PgTransaction } from "drizzle-orm/pg-core";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";

async function fetchMembersData(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  groupId: string,
) {
  const members = await getMembersFromDB(transaction, groupId);
  const allUserInfo = await getUserInfoForMembers(transaction, members);
  return await addUserInfoToMembers(transaction, members, allUserInfo);
}

export async function fetchGroupData(groupId: string): Promise<TGroupData> {
  const [group, members, bills] = await db.transaction(async (transaction) => {
    return await Promise.all([
      getGroupFromDB(transaction, groupId),
      fetchMembersData(transaction, groupId),
      getGroupBillsFromDB(transaction, groupId, 9, 1),
    ]);
  });

  const groupData = formatGroupData({ group, members, bills });
  return groupData;
}

export async function isMemberInGroup(
  userId: string | undefined,
  groupId: string,
): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("members_table")
    .select("status")
    .eq("user_id", userId)
    .eq("group_id", groupId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return 0;
    }
    console.error("Error checking member existence:", error.message);
    throw error;
  }

  return Number(data.status);
}
