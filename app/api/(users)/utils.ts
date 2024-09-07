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
  let requestSent;
  await db.transaction(async (transaction) => {
    let groupId = requestData.group_id;

    let groups = await transaction
      .select()
      .from(groupsTable)
      .where(eq(groupsTable.id, groupId));

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
          throw new Error("Sender is not an Admin");
        }
        senderInfo = member;
      }
      if (member.userId === receiver.id) {
        receiverInfo = member;
      }

      if (member.userIndex === requestData.user_index && member.isTemporary) {
        validUserIndex = true;
      }
    }

    if (senderInfo === null) {
      throw new Error("Invalid Sender Id");
    }
    if (receiverInfo === null) {
      throw new Error("Invalid Receiver Id");
    }

    if (!validUserIndex) {
      throw new Error("userIndex is not Valid");
    }

    let newRequest = {
      userId: receiver.id,
      groupId: groupId,
      userIndex: requestData.user_index,
    };

    await transaction.insert(requestTable).values(newRequest);
    await transaction
      .update(membersTable)
      .set({ isTemporary: true })
      .where(
        and(
          eq(membersTable.groupId, groupId),
          eq(membersTable.userIndex, requestData.user_index),
        ),
      );
  });
}

// export function splitDraweesEqually(amount: number, length: number) {
//   let split = [];
//   let used = 0.0,
//     cur = parseFloat((amount / length).toFixed(2));
//   for (let i = 0; i < length; ++i) {
//     used += cur;
//     split.push(cur);
//   }
//   for (let i = 0; i < length; ++i) {
//     if (used == amount) break;
//     split[i] += 0.01;
//     used -= 0.01;
//   }
//   console.log(split);
// }

// export function splitDraweesPercentageWise(
//   amount: number,
//   percentages: number[],
// ) {
//   let split = [];
//   let used = 0.0;
//   for (let i = 0; i < percentages.length; ++i) {
//     let cur = parseFloat(((percentages[i] * amount) / 100.0).toFixed(2));
//     used += cur;
//     split.push(cur);
//   }
//   for (let i = 0; i < percentages.length; ++i) {
//     if (used == amount) break;
//     split[i] += 0.01;
//     used -= 0.01;
//   }
//   console.log(split);
// }
