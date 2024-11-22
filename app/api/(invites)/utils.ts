import { inviteTable, membersTable } from "@/database/schema";
import { and, eq, ExtractTablesWithRelations, inArray, or } from "drizzle-orm";
import { PgTransaction } from "drizzle-orm/pg-core";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import { getMultipleGroupsFromDB } from "../(groups)/utils";
import { getMultipleUserFromDB, getUserFromDB } from "../(users)/utils";

export async function sendInvite(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  groupId: string,
  senderUserId: string,
  receiverUserId: string,
  userIndex: number,
) {
  // CREATE INVITE FOR RECEIVER
  let newInvite = {
    senderUserId: senderUserId,
    receiverUserId: receiverUserId,
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
  senderUserId: string,
  receiverUserIds: string[],
  userIndexes: number[],
) {
  // CREATE INVITE FOR RECEIVER

  let newInvites: any = [];
  if (
    receiverUserIds === undefined ||
    receiverUserIds.length === 0 ||
    userIndexes === undefined ||
    userIndexes.length === 0
  ) {
    return;
  }

  if (receiverUserIds.length !== userIndexes.length) {
    throw new Error("receiverUserIds and userIndexes should have same length");
  }

  for (let i = 0; i < receiverUserIds.length; ++i) {
    newInvites.push({
      senderUserId: senderUserId,
      receiverUserId: receiverUserIds[i],
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
  isSenderValidated: boolean,
  isUserIndexValidated: boolean,
) {
  for (let member of members) {
    // IF SENDER IS NOT AN ADMIN
    if (member.userId === senderUserId) {
      if (!member.isAdmin) {
        throw new Error("sender is not admin of the group");
      }
      isSenderValidated = true;
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

    // USER INDEX IS OF TEMPORARY MEMBER
    if (member.userIndex === userIndex && member.status === 0) {
      isUserIndexValidated = true;
    }
  }

  // SENDER IS NOT AN MEMBER OF GROUP
  if (!isSenderValidated) {
    throw new Error("sender is not a member of the group");
  }

  if (!isUserIndexValidated) {
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
        eq(inviteTable.userIndex, userIndex),
        eq(inviteTable.groupId, groupId),
      ),
    );

  if (userInvites.length === 0) {
    throw new Error("No invites exists");
  }

  let userInvite = userInvites[0];

  let isUserAuthorized: boolean = userInvite.receiverUserId === userId;
  if (!isUserAuthorized) {
    let members = await transaction
      .select()
      .from(membersTable)
      .where(
        and(eq(membersTable.userId, userId), eq(membersTable.groupId, groupId)),
      );
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
    .set({ userId: groupId + " | " + userInvite.userIndex, status: 0 })
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
        eq(inviteTable.receiverUserId, userInvite.receiverUserId as string),
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
      and(
        eq(inviteTable.groupId, groupId),
        eq(inviteTable.receiverUserId, userId),
      ),
    );

  if (userInvites.length === 0) {
    throw new Error("No invites exists");
  }

  let user = await getUserFromDB(transaction, userId);

  let userInvite = userInvites[0];

  await transaction
    .update(membersTable)
    .set({ status: 2, userNameInGroup: user.name })
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
        eq(inviteTable.receiverUserId, userInvite.receiverUserId as string),
      ),
    );
}

export async function getUserInvitesFromDB(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  userId: string,
) {
  let userInvites: any = [];
  let invites = await transaction
    .select()
    .from(inviteTable)
    .where(eq(inviteTable.receiverUserId, userId));

  if (invites.length === 0) {
    return [];
  }

  let groupIds = invites.map((invite) => invite.groupId!);
  let groupInfo = await getMultipleGroupsFromDB(transaction, groupIds);

  let senderUserIds = invites.map((invite) => invite.senderUserId!);
  let senderUserInfo = await getMultipleUserFromDB(transaction, senderUserIds);

  let senderUserInfoMap = new Map();
  for (let user of senderUserInfo) {
    senderUserInfoMap.set(user.id, {
      senderName: user.name,
      senderAvatarUrl: user.avatarUrl,
    });
  }

  let groupInfoMap = new Map();
  for (let group of groupInfo) {
    groupInfoMap.set(group.id, {
      groupName: group.name,
      groupBackgroundUrl: group.backgroundUrl,
    });
  }

  // console.log(groupInfoMap);
  for (let invite of invites) {
    let groupInfo = groupInfoMap.get(invite.groupId);
    let senderInfo = senderUserInfoMap.get(invite.senderUserId);

    userInvites.push({
      ...invite,
      groupName: groupInfo.groupName,
      groupBackgroundUrl: groupInfo.groupBackgroundUrl,
      senderName: senderInfo.senderName,
      senderAvatarUrl: senderInfo.senderAvatarUrl,
    });
  }

  return userInvites;
}

export async function getGroupInvitesFromDB(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  groupId: string,
) {
  const invites = await transaction
    .select()
    .from(inviteTable)
    .where(eq(inviteTable.groupId, groupId));
  return invites;
}
