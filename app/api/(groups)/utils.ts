import { client, db } from "@/database/dbConnect";
import {
  billsTable,
  draweesInBillsTable,
  groupsTable,
  membersTable,
  payeesInBillsTable,
  inviteTable,
  transactionsTable,
  usersTable,
} from "@/database/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { PgSelect } from "drizzle-orm/pg-core";
import { sendInvite, receiverValidation } from "../(invites)/utils";

export async function createGroupInDB(requestData: any) {
  let group;
  await db.transaction(async (transaction) => {
    const newGroup = {
      name: requestData.name,
    };

    let groups = await transaction
      .insert(groupsTable)
      .values(newGroup)
      .returning();
    group = groups[0];

    // createKafkaTopic(group.id);
  });

  return group;
}

export async function addMembersInDB(
  requestData: any,
  isNewGroup: boolean,
  owner: any,
) {
  let newMembers: any = [];
  await db.transaction(async (transaction) => {
    let groupId = requestData.group_id;

    const existingMembers = await transaction
      .select()
      .from(membersTable)
      .where(eq(membersTable.groupId, groupId));

    let count = existingMembers.length === null ? 0 : existingMembers.length;
    // console.log(requestData.users);

    if (requestData.members === undefined) {
      throw new Error("Send Members List");
    }

    // console.log(owner);

    if (isNewGroup) {
      newMembers.push({
        userId: owner.id,
        groupId: groupId,
        userNameInGroup: owner.name,
        isAdmin: true,
        status: 2,
        userIndex: count++,
        totalSpent: "0",
        totalPaid: "0",
      });
    }

    let receiverIds: any = [];
    for (let username of requestData.usernames) {
      let receiver = await receiverValidation(username, transaction);
      await sendInvite(
        { group_id: groupId, user_index: count },
        true,
        receiver.id,
      );
      newMembers.push({
        userId: groupId + " | " + count,
        groupId: groupId,
        userNameInGroup: receiver.name,
        userIndex: count++,
        totalSpent: "0",
        totalPaid: "0",
      });
    }

    for (let member of requestData.members) {
      newMembers.push({
        userId: groupId + " | " + count,
        groupId: groupId,
        userNameInGroup: member,
        userIndex: count++,
        totalSpent: "0",
        totalPaid: "0",
      });
    }
    // console.log(newMembers);

    newMembers = await transaction
      .insert(membersTable)
      .values(newMembers)
      .returning();
  });
  return newMembers;
}

export async function getGroupFromDB(requestData: any) {
  let group;
  await db.transaction(async (transaction) => {
    let groupId = requestData.group_id;
    let groups = await transaction
      .select()
      .from(groupsTable)
      .where(eq(groupsTable.id, groupId));

    if (groups.length == 0) {
      throw new Error("Invalid Group Id");
    }

    group = groups[0];
  });

  return group;
}

export async function getMembersFromDB(requestData: any) {
  let membersInGroup: any = [];
  await db.transaction(async (transaction) => {
    let groupId = requestData.group_id;
    let members = await transaction
      .select()
      .from(membersTable)
      .where(eq(membersTable.groupId, groupId));

    if (members.length == 0) {
      return members;
    }

    members = members.sort(
      (i, j) => (i.userIndex as number) - (j.userIndex as number),
    );

    let regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    let userIds = members
      .filter((member) => regex.test(member.userId))
      .map((member) => member.userId);
    // console.log(userIds);

    let userInfo = await transaction
      .select()
      .from(usersTable)
      .where(inArray(usersTable.id, userIds));
    // console.log(userInfo);

    let userInfoMap = new Map();
    for (let user of userInfo) {
      userInfoMap.set(user.id, user);
    }

    for (let member of members) {
      let user = userInfoMap.get(member.userId);
      if (user !== undefined) {
        membersInGroup.push({
          ...member,
          avatarUrl: user.avatar_url,
          username: user.username,
        });
      } else {
        membersInGroup.push({
          ...member,
          avatarUrl: null,
          username: null,
        });
      }
    }
  });

  return membersInGroup;
}

export async function deleteGroupInDB(requestData: any) {
  let groupId;
  await db.transaction(async (transaction) => {
    groupId = requestData.group_id;

    // Delete Transactions
    await transaction
      .delete(transactionsTable)
      .where(eq(transactionsTable.groupId, groupId));

    // delete drawees and payees
    let bills = await transaction
      .select()
      .from(billsTable)
      .where(eq(billsTable.groupId, groupId));

    for (let bill of bills) {
      await transaction
        .delete(draweesInBillsTable)
        .where(eq(draweesInBillsTable.billId, bill.id));
      await transaction
        .delete(payeesInBillsTable)
        .where(eq(payeesInBillsTable.billId, bill.id));
    }

    // delete usersInGroup
    await transaction
      .delete(membersTable)
      .where(eq(membersTable.groupId, groupId));

    // Delete Bills
    await transaction.delete(billsTable).where(eq(billsTable.groupId, groupId));

    // Delete Group
    await transaction.delete(groupsTable).where(eq(groupsTable.id, groupId));

    // deleteKafkaTopics(groupId);
  });
  return groupId;
}

export async function getGroupBillsFromDB(requestData: any) {
  let bills: any = [];
  await db.transaction(async (transaction) => {
    let groupId = requestData.group_id;

    let pageSize = requestData.hasOwnProperty("page_size")
      ? requestData.page_size
      : 10;
    let page = requestData.hasOwnProperty("page") ? requestData.page : 1;

    let billsFromDB = await withPagination(
      transaction
        .select()
        .from(billsTable)
        .where(eq(billsTable.groupId, groupId))
        .orderBy(desc(billsTable.createdAt))
        .$dynamic(),
      page,
      pageSize,
    );

    // console.log(billsFromDB);

    for (let bill of billsFromDB) {
      let drawees = await transaction
        .select()
        .from(draweesInBillsTable)
        .where(eq(draweesInBillsTable.billId, bill.id));
      let payees = await transaction
        .select()
        .from(payeesInBillsTable)
        .where(eq(payeesInBillsTable.billId, bill.id));

      bills.push({
        ...bill,
        drawees: drawees,
        payees: payees,
      });
      // console.log(bills);
    }
  });
  return bills;
}

function withPagination<T extends PgSelect>(
  qb: T,
  page: number = 1,
  pageSize: number = 10,
) {
  return qb.limit(pageSize).offset((page - 1) * pageSize);
}

// export async function createKafkaTopic(groupId: string) {
//   await admin.connect();
//   let response = await admin.createTopics({
//     topics: [
//       {
//         topic: groupId,
//         numPartitions: 1,
//         replicationFactor: -1,
//       },
//     ],
//   });
//   await admin.disconnect();
//   if (response === null) {
//     throw new Error("Failed to Create Topic");
//   }
// }

// export async function deleteKafkaTopics(groupId: string) {
//   await admin.connect();
//   let response = await admin.deleteTopics({
//     topics: [
//       {
//         topic: groupId,
//         numPartitions: 1,
//         replicationFactor: -1,
//       },
//     ],
//   });
//   await admin.disconnect();
//   if (response === null) {
//     throw new Error("Failed to Delete Topic");
//   }
// }
