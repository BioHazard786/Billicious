import { client, db } from "@/database/dbConnect";
import {
  groupsTable,
  membersTable,
  requestTable,
  usersTable,
} from "@/database/schema";
import { and, eq, or } from "drizzle-orm";

export async function addUsersInDB(requestData: any) {
  let user: any = {};
  await db.transaction(async (transaction) => {
    const newUser = {
      id: requestData.id,
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
      .where(eq(usersTable.id, requestData.user_id));
    if (users.length === 0) {
      throw new Error("Invalid UserId");
    }
    user = users[0];
  });
  return user;
}

export async function sendRequest(requestData: any) {
  await db.transaction(async (transaction) => {
    let groups = await transaction
      .select()
      .from(groupsTable)
      .where(eq(groupsTable.id, requestData.group_id));

    if (groups.length === 0) {
      throw new Error("Invalid Group Id");
    }

    let users;
    users = await transaction
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, requestData.sender_user_id));
    if (users.length === 0) {
      throw new Error("Invalid Sender's UserId");
    }
    let sender = users[0];

    users = await transaction
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, requestData.receiver_username));
    if (users.length === 0) {
      throw new Error("Invalid Receiver's Username");
    }
    let receiver = users[0];

    let members = await transaction.select().from(membersTable);
    let senderInfo = null,
      receiverInfo = null;
    let validUserIndex = false;
    for (let member of members) {
      if (member.userId === sender.id) {
        // check if sender is admin
        if (!member.isAdmin) {
          throw new Error("Sender is not an admin of group");
        }
        senderInfo = member;
      }

      if (member.userIndex === requestData.user_index && member.isTemporary) {
        validUserIndex = true;
      }
    }

    if (senderInfo === null) {
      throw new Error("Sender is not a member of group");
    }

    if (!validUserIndex) {
      throw new Error("userIndex is not Valid");
    }

    let newRequest = {
      userId: receiver.id,
      groupId: requestData.group_id,
      userIndex: requestData.user_index,
    };

    await transaction.insert(requestTable).values(newRequest);
    await transaction
      .update(membersTable)
      .set({ isTemporary: false })
      .where(
        and(
          eq(membersTable.groupId, requestData.group_id),
          eq(membersTable.userIndex, requestData.user_index),
        ),
      );
  });
}

export async function deleteRequest(requestData: any) {
  await db.transaction(async (transaction) => {
    let groupRequests = await transaction
      .select()
      .from(requestTable)
      .where(and(eq(requestTable.groupId, requestData.group_id)));
    groupRequests = groupRequests.filter(
      (groupRequest) => groupRequest.userIndex === requestData.user_index,
    );

    if (groupRequests.length === 0) {
      throw new Error("No request exists");
    }

    let groupRequest = groupRequests[0];

    await transaction
      .update(membersTable)
      .set({ isTemporary: false })
      .where(
        and(
          eq(membersTable.groupId, groupRequest.groupId as string),
          eq(membersTable.userIndex, groupRequest.userIndex as number),
        ),
      );

    await transaction
      .delete(requestTable)
      .where(
        or(
          eq(requestTable.groupId, groupRequest.groupId as string),
          eq(requestTable.userId, groupRequest.userId as string),
        ),
      );
  });
}

export async function acceptRequest(requestData: any) {
  await db.transaction(async (transaction) => {
    let groupRequests = await transaction
      .select()
      .from(requestTable)
      .where(
        and(
          eq(requestTable.groupId, requestData.group_id),
          eq(requestTable.userId, requestData.user_id),
        ),
      );

    if (groupRequests.length === 0) {
      throw new Error("No request exists");
    }

    let groupRequest = groupRequests[0];

    await transaction
      .update(membersTable)
      .set({ userId: requestData.user_id })
      .where(
        and(
          eq(membersTable.groupId, groupRequest.groupId as string),
          eq(membersTable.userIndex, groupRequest.userIndex as number),
        ),
      );

    await transaction
      .delete(requestTable)
      .where(
        or(
          eq(requestTable.groupId, groupRequest.groupId as string),
          eq(requestTable.userId, groupRequest.userId as string),
        ),
      );
  });
}
