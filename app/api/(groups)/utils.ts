import TotalExpense from "@/components/dashboard/total-expense";
import { client, db } from "@/database/dbConnect";
import {
  billsTable,
  draweesInBillsTable,
  groupsTable,
  membersTable,
  payeesInBillsTable,
  transactionsTable,
  requestTable,
} from "@/database/schema";
import { desc, eq } from "drizzle-orm";
import { PgSelect } from "drizzle-orm/pg-core";

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

export async function addMembersInDB(requestData: any) {
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

    await transaction.insert(membersTable).values(newMembers).returning();
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
  let members;
  await db.transaction(async (transaction) => {
    let groupId = requestData.group_id;
    members = await transaction
      .select()
      .from(membersTable)
      .where(eq(membersTable.groupId, groupId));

    if (members.length == 0) {
      throw new Error("No members In Group");
    }

    members = members.sort(
      (i, j) => (i.userIndex as number) - (j.userIndex as number),
    );
  });

  return members;
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
  let bills;
  await db.transaction(async (transaction) => {
    let groupId = requestData.group_id;

    let pageSize = requestData.hasOwnProperty("page_size")
      ? requestData.page_size
      : 10;
    let page = requestData.hasOwnProperty("page") ? requestData.page : 1;

    bills = await withPagination(
      transaction
        .select()
        .from(billsTable)
        .where(eq(billsTable.groupId, groupId))
        .orderBy(desc(billsTable.createdAt))
        .$dynamic(),
      page,
      pageSize,
    );
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

export async function getRequestFromDB(requestData: any) {
  let groupRequests;
  await db.transaction(async (transaction) => {
    groupRequests = await transaction
      .select()
      .from(requestTable)
      .where(eq(requestTable.groupId, requestData.group_id));

    groupRequests = groupRequests.sort(
      (i, j) => (i.userIndex as number) - (j.userIndex as number),
    );

    if (groupRequests.length === 0) {
      throw new Error("No request exists");
    }
    return groupRequests;
  });
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
