import { client, db } from "@/database/dbConnect";
import {
  usersGroupsTable,
  groupsTable,
  billsTable,
  transactionsTable,
  draweesInBills,
  payeesInBills,
} from "@/database/schema";
import { eq } from "drizzle-orm";
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
  });

  return group;
}

export async function addUsersInDB(requestData: any) {
  let users;
  await db.transaction(async (transaction) => {
    let groupId = requestData.group_id;
    let newUsers = [];

    const usersInGroup = await transaction
      .select()
      .from(usersGroupsTable)
      .where(eq(usersGroupsTable.groupId, groupId));

    let count = usersInGroup.length === null ? 0 : usersInGroup.length;
    // console.log(requestData.users);
    for (let user of requestData.users) {
      newUsers.push({
        userId: groupId + " | " + count,
        groupId: groupId,
        userNameInGroup: user,
        userIndex: count++,
        totalAmount: "0",
      });
    }

    users = await transaction
      .insert(usersGroupsTable)
      .values(newUsers)
      .returning();
  });
  return users;
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

export async function getUsersFromDB(requestData: any) {
  let users;
  await db.transaction(async (transaction) => {
    let groupId = requestData.group_id;
    users = await transaction
      .select()
      .from(usersGroupsTable)
      .where(eq(usersGroupsTable.groupId, groupId));

    if (users.length == 0) {
      throw new Error("Invalid Group Id");
    }
  });

  return users;
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
        .delete(draweesInBills)
        .where(eq(draweesInBills.billId, bill.id));
      await transaction
        .delete(payeesInBills)
        .where(eq(payeesInBills.billId, bill.id));
    }

    // delete usersInGroup
    await transaction
      .delete(usersGroupsTable)
      .where(eq(usersGroupsTable.groupId, groupId));

    // Delete Bills
    await transaction.delete(billsTable).where(eq(billsTable.groupId, groupId));

    // Delete Group
    await transaction.delete(groupsTable).where(eq(groupsTable.id, groupId));
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
