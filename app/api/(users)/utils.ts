import { client, db } from "@/database/dbConnect";
import { groupsTable, membersTable, usersTable } from "@/database/schema";
import { and, eq, or, inArray, ExtractTablesWithRelations } from "drizzle-orm";
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
  let groups = await transaction
    .select()
    .from(membersTable)
    .where(eq(membersTable.userId, userId));

  if (groups.length === 0) {
    return groups;
  }

  let groupIds = groups.map((group) => group.groupId!);
  // console.log(groupIds);

  let groupInfo = await getMultipleGroupsFromDB(transaction, groupIds);
  // console.log(groupInfo);

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
  return userGroups;
}
