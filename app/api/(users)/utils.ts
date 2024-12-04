import { client, db } from "@/database/dbConnect";
import { groupsTable, membersTable, usersTable } from "@/database/schema";
import { and, eq, ExtractTablesWithRelations, inArray, or } from "drizzle-orm";
import { PgTransaction } from "drizzle-orm/pg-core";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import { getMultipleGroupsFromDB } from "../(groups)/utils";

export async function addUsersInDB(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  id: string,
  name: string,
  username: string,
) {
  const newUser = {
    id: id,
    name: name,
    username: username,
  };

  let user = await transaction.insert(usersTable).values(newUser).returning();
  return user;
}

export async function getUserFromDB(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  userId: string,
) {
  let users = await transaction
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  if (users.length === 0) {
    throw new Error("Invalid UserId");
  }
  let user = users[0];
  return user;
}

export async function getMultipleUserFromDB(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  userId: string[],
) {
  let users = await transaction
    .select()
    .from(usersTable)
    .where(inArray(usersTable.id, userId));
  return users;
}

export async function getUserFromDBViaUsername(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  username: string,
) {
  let users = await transaction
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));
  if (users.length === 0) {
    throw new Error("Invalid UserId");
  }
  let user = users[0];
  return user;
}

export async function getMultipleUserFromDBViaUsername(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  usernames: string[],
) {
  if (usernames === undefined || usernames.length === 0) {
    return [];
  }
  let users = await transaction
    .select()
    .from(usersTable)
    .where(inArray(usersTable.username, usernames));
  return users;
}

export async function getUserGroupsFromDB(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  userId: string,
) {
  let userGroups: any = [];
  let memberGroups = await transaction
    .select()
    .from(membersTable)
    .where(eq(membersTable.userId, userId));

  memberGroups = memberGroups.filter((group) => group.status === 2);
  if (memberGroups.length === 0) {
    return [];
  }

  let groupIds = memberGroups.map((group) => group.groupId!);
  // console.log(groupIds);

  let groupInfo = await getMultipleGroupsFromDB(transaction, groupIds);
  // console.log(groupInfo);

  let groupInfoMap = new Map();
  for (let group of groupInfo) {
    groupInfoMap.set(group.id, group);
  }

  for (let memberGroup of memberGroups) {
    let group = groupInfoMap.get(memberGroup.groupId);
    if (group !== undefined) {
      userGroups.push({
        groupId: memberGroup.groupId,
        userNameInGroup: memberGroup.userNameInGroup,
        totalSpent: memberGroup.totalSpent,
        totalPaid: memberGroup.totalPaid,
        groupName: group.name,
        totalExpense: group.totalExpense,
        backgroundUrl: group.backgroundUrl,
        currencyCode: group.currencyCode,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        isAdmin: memberGroup.isAdmin,
      });
    } else {
      userGroups.push({
        groupId: memberGroup.groupId,
        userNameInGroup: memberGroup.userNameInGroup,
        totalSpent: memberGroup.totalSpent,
        totalPaid: memberGroup.totalPaid,
        isAdmin: memberGroup.isAdmin,
      });
    }
  }
  return userGroups;
}
