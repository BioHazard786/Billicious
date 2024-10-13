import { client, db } from "@/database/dbConnect";
import {
  groupsTable,
  membersTable,
  inviteTable,
  usersTable,
} from "@/database/schema";
import { and, eq, or } from "drizzle-orm";

export async function sendInvite(
  requestData: any,
  isSenderAndGroupValidated: boolean,
  receiverId: string,
) {
  await db.transaction(async (transaction) => {
    if (!isSenderAndGroupValidated) {
      await senderAndGroupValidation(requestData, transaction);
    }

    if (receiverId == null) {
      receiverId = await receiverValidation(requestData.username, transaction);
    }

    let newInvite = {
      userId: receiverId,
      groupId: requestData.group_id,
      userIndex: requestData.user_index,
    };

    await transaction.insert(inviteTable).values(newInvite);
    await transaction
      .update(membersTable)
      .set({ status: 1 })
      .where(
        and(
          eq(membersTable.groupId, requestData.group_id),
          eq(membersTable.userIndex, requestData.user_index),
        ),
      );
  });
}

async function senderAndGroupValidation(requestData: any, transaction: any) {
  let groups = await transaction
    .select()
    .from(groupsTable)
    .where(eq(groupsTable.id, requestData.group_id));

  if (groups.length === 0) {
    throw new Error("Invalid Group Id");
  }

  let users = await transaction
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, requestData.sender_user_id));
  if (users.length === 0) {
    throw new Error("Invalid Sender's UserId:" + requestData.sender_user_id);
  }
  let sender = users[0];

  let members = await transaction
    .select()
    .from(membersTable)
    .where(eq(membersTable.groupId, requestData.group_id));
  let senderInfo = null;
  let validUserIndex = false;
  for (let member of members) {
    if (member.userId === sender.id) {
      if (!member.isAdmin) {
        throw new Error("Sender is not an admin of group");
      }
      senderInfo = member;
    }

    if (member.userIndex === requestData.user_index && member.status === 0) {
      validUserIndex = true;
    }
  }

  if (senderInfo === null) {
    throw new Error("Sender is not a member of group");
  }

  if (!validUserIndex) {
    throw new Error("userIndex is not Valid: " + requestData.user_index);
  }

  return true;
}

export async function receiverValidation(requestData: any, transaction: any) {
  let users = await transaction
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, requestData.receiver_username));
  if (users.length === 0) {
    throw new Error(
      "Invalid Receiver's Username: " + requestData.receiver_username,
    );
  }
  return users[0];
}

export async function deleteInvite(requestData: any) {
  await db.transaction(async (transaction) => {
    let userInvites = await transaction
      .select()
      .from(inviteTable)
      .where(
        and(
          eq(inviteTable.groupId, requestData.group_id),
          eq(inviteTable.userIndex, requestData.user_index),
        ),
      );

    if (userInvites.length === 0) {
      throw new Error("No invites exists");
    }

    let userInvite = userInvites[0];

    let isUserAuthorized: boolean = userInvite.userId === requestData.user_id;
    if (!isUserAuthorized) {
      let members = await transaction
        .select()
        .from(membersTable)
        .where(eq(membersTable.userId, requestData.user_id));
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
      .set({ status: 0 })
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
  });
}

export async function acceptInvite(requestData: any) {
  await db.transaction(async (transaction) => {
    let userInvites = await transaction
      .select()
      .from(inviteTable)
      .where(
        and(
          eq(inviteTable.groupId, requestData.group_id),
          eq(inviteTable.userId, requestData.user_id),
        ),
      );

    if (userInvites.length === 0) {
      throw new Error("No invites exists");
    }

    let userInvite = userInvites[0];

    await transaction
      .update(membersTable)
      .set({ userId: requestData.user_id, status: 2 })
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
  });
}

export async function getInvitesFromDB(requestData: any) {
  let invites: any = [];
  await db.transaction(async (transaction) => {
    invites = await transaction
      .select()
      .from(inviteTable)
      .where(
        or(
          eq(
            inviteTable.userId,
            requestData.user_id === undefined ? null : requestData.user_id,
          ),
          eq(
            inviteTable.groupId,
            requestData.group_id === undefined ? null : requestData.group_id,
          ),
        ),
      );
  });
  return invites;
}
