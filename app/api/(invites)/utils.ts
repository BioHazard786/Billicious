import { membersTable, inviteTable } from "@/database/schema";
import { and, eq, ExtractTablesWithRelations, or } from "drizzle-orm";
import { PgTransaction } from "drizzle-orm/pg-core";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import { getGroupFromDB, getMembersFromDB } from "../(groups)/utils";

export async function sendInvite(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  groupId: string,
  receiverUserId: string,
  userIndex: number,
) {
  // CREATE INVITE FOR RECEIVER
  let newInvite = {
    userId: receiverUserId,
    groupId: groupId,
    userIndex: userIndex,
  };
  await transaction.insert(inviteTable).values(newInvite);

  await transaction
    .update(membersTable)
    .set({ userId: receiverUserId, status: 1 })
    .where(
      and(
        eq(membersTable.groupId, groupId),
        eq(membersTable.userIndex, userIndex),
      ),
    );
}

export async function sendMultipleInvites(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  groupId: string,
  receiverUserIds: string[],
  userIndexes: number[],
) {
  // CREATE INVITE FOR RECEIVER

  let newInvites: any = [];

  for (let i = 0; i < receiverUserIds.length; ++i) {
    newInvites.push({
      userId: receiverUserIds[i],
      groupId: groupId,
      userIndex: userIndexes[i],
    });
  }
  await transaction.insert(inviteTable).values(newInvites);
}

export async function senderAndReceiverValidationInGroup(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  members: any[],
  senderUserId: string,
  receiverUserId: string,
  userIndex: number,
  isValidUserIndex: boolean,
) {
  let senderInfo = null;

  for (let member of members) {
    // IF SENDER IS NOT AN ADMIN
    if (member.userId === senderUserId) {
      if (!member.isAdmin) {
        throw new Error("sender is not admin of the group");
      }
      senderInfo = member;
    }

    // RECEIVER IS ALREADY ADDED TO GROUP
    if (member.userId === receiverUserId) {
      if (member.status === 1) {
        throw new Error(
          "receiver is already invited at position: " + member.userIndex,
        );
      } else {
        throw new Error("receiver is already a member of the group");
      }
    }

    // USER INDEX IS NOT OF TEMPORARY MEMBER
    if (member.userIndex === userIndex && member.status !== 0) {
      isValidUserIndex = true;
    }
  }

  // SENDER IS NOT AN MEMBER OF GROUP
  if (senderInfo === null) {
    throw new Error("sender is not a member of the group");
  }

  if (!isValidUserIndex) {
    throw new Error("userIndex is not Valid: " + userIndex);
  }

  return true;
}

export async function deleteInvite(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  groupId: string,
  userId: string,
  userIndex: number,
) {
  let userInvites = await transaction
    .select()
    .from(inviteTable)
    .where(
      and(
        eq(inviteTable.groupId, groupId),
        eq(inviteTable.userIndex, userIndex),
      ),
    );

  if (userInvites.length === 0) {
    throw new Error("No invites exists");
  }

  let userInvite = userInvites[0];

  let isUserAuthorized: boolean = userInvite.userId === userId;
  if (!isUserAuthorized) {
    let members = await transaction
      .select()
      .from(membersTable)
      .where(eq(membersTable.userId, userId));
    if (members.length === 0) {
      throw new Error("only receiver or admins could delete invite");
    }
    let member = members[0];
    if (!member.isAdmin) {
      throw new Error("only admins could delete invite");
    }
    isUserAuthorized = true;
  }

  if (!isUserAuthorized) {
    throw new Error("not authorized to delete invite");
  }

  await transaction
    .update(membersTable)
    .set({ userId: groupId + " | " + userIndex, status: 0 })
    .where(
      and(
        eq(membersTable.groupId, userInvite.groupId as string),
        eq(membersTable.userIndex, userInvite.userIndex as number),
      ),
    );

  await transaction
    .delete(inviteTable)
    .where(
      and(
        eq(inviteTable.groupId, userInvite.groupId as string),
        eq(inviteTable.userId, userInvite.userId as string),
      ),
    );
}

export async function acceptInvite(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  groupId: string,
  userId: string,
) {
  let userInvites = await transaction
    .select()
    .from(inviteTable)
    .where(
      and(eq(inviteTable.groupId, groupId), eq(inviteTable.userId, userId)),
    );

  if (userInvites.length === 0) {
    throw new Error("No invites exists");
  }

  let userInvite = userInvites[0];

  await transaction
    .update(membersTable)
    .set({ status: 2 })
    .where(
      and(
        eq(membersTable.groupId, userInvite.groupId as string),
        eq(membersTable.userIndex, userInvite.userIndex as number),
      ),
    );

  await transaction
    .delete(inviteTable)
    .where(
      and(
        eq(inviteTable.groupId, userInvite.groupId as string),
        eq(inviteTable.userId, userInvite.userId as string),
      ),
    );
}

export async function getInvitesFromDB(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  userId: string,
  groupId: string,
) {
  let invites: any = [];
  invites = await transaction
    .select()
    .from(inviteTable)
    .where(
      or(eq(inviteTable.userId, userId), eq(inviteTable.groupId, groupId)),
    );
  return invites;
}
