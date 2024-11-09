import {
  billsTable,
  draweesInBillsTable,
  groupsTable,
  membersTable,
  payeesInBillsTable,
  transactionsTable,
} from "@/database/schema";
import {
  and,
  desc,
  eq,
  ExtractTablesWithRelations,
  inArray,
} from "drizzle-orm";
import { PgSelect, PgTransaction } from "drizzle-orm/pg-core";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import {
  senderAndReceiverValidationInGroup,
  sendMultipleInvites,
} from "../(invites)/utils";
import {
  getMultipleUserFromDB,
  getMultipleUserFromDBViaUsername,
  getUserFromDB,
} from "../(users)/utils";

export async function createGroupInDB(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  name: string,
  backgroundUrl: string,
  currencyCode: string,
) {
  const newGroup = {
    name: name,
    backgroundUrl: backgroundUrl,
    currencyCode: currencyCode,
  };

  let groups = await transaction
    .insert(groupsTable)
    .values(newGroup)
    .returning();
  let group = groups[0];

  return group;
}

export async function addMembersInDB(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  groupId: string,
  isNewGroup: boolean,
  ownerId: string,
  members: string[],
  usernames: string[],
) {
  let newMembers: any = [];

  let owner = await getUserFromDB(transaction, ownerId);

  const existingMembers = await getMembersFromDB(transaction, groupId);

  let count = existingMembers.length === null ? 0 : existingMembers.length;

  // ADD OWNER IF A NEW GROUP IS GETTING CREATED
  if (isNewGroup) {
    newMembers.push({
      userId: ownerId,
      groupId: groupId,
      userNameInGroup: owner.name,
      isAdmin: true,
      status: 2,
      userIndex: count++,
      totalSpent: "0",
      totalPaid: "0",
    });
  } else {
    await getGroupFromDB(transaction, groupId);
  }

  // SEND INVITES TO THE MULTIPLE USERNAMES
  let receiverIds: string[] = [];
  let userIndexes: number[] = [];
  let receivers = await getMultipleUserFromDBViaUsername(
    transaction,
    usernames,
  );
  for (let receiver of receivers) {
    if (
      isNewGroup ||
      (await senderAndReceiverValidationInGroup(
        transaction,
        existingMembers,
        ownerId,
        receiver.id,
        count,
        true,
        true,
      ))
    ) {
      receiverIds.push(receiver.id);
      userIndexes.push(count);
      newMembers.push({
        userId: receiver.id,
        groupId: groupId,
        userNameInGroup: receiver.name,
        userIndex: count++,
        status: 1, // invited
        totalSpent: "0",
        totalPaid: "0",
      });
    }
  }
  await sendMultipleInvites(
    transaction,
    groupId,
    ownerId,
    receiverIds,
    userIndexes,
  );

  // CREATE TEMPORARY USERS
  if (members !== undefined) {
    for (let member of members) {
      newMembers.push({
        userId: groupId + " | " + count,
        groupId: groupId,
        userNameInGroup: member,
        userIndex: count++,
        totalSpent: "0",
        totalPaid: "0",
      });
    }
  }

  if (newMembers.length === 0) {
    throw new Error("No new members to add");
  }

  // ADD MEMBERS TO DB
  newMembers = await transaction
    .insert(membersTable)
    .values(newMembers)
    .returning();

  newMembers = await addUserInfoToMembers(transaction, newMembers, receivers);

  return newMembers;
}

export async function getGroupFromDB(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  groupId: string,
) {
  let groups = await transaction
    .select()
    .from(groupsTable)
    .where(eq(groupsTable.id, groupId));

  if (groups.length == 0) {
    throw new Error("Invalid Group Id");
  }
  let group = groups[0];
  return group;
}

export async function createAdmin(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  groupId: string,
  ownerId: string,
  userIndex: number,
) {
  let membersInGroup = await getMembersFromDB(transaction, groupId);

  if (userIndex >= membersInGroup.length) {
    throw new Error("invalid user index");
  }

  for (let member of membersInGroup) {
    if (member.userIndex === 0 && member.userId !== ownerId) {
      throw new Error("only owner can add admins to group");
    }
    if (member.userIndex === userIndex) {
      if (member.status !== 2) {
        throw new Error("only permanent members can be made admins");
      } else {
        transaction
          .update(membersTable)
          .set({ isAdmin: true })
          .where(
            and(
              eq(membersTable.groupId, groupId),
              eq(membersTable.userId, ownerId),
            ),
          );
      }
    }
  }
}

export async function removeAdmin(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  groupId: string,
  ownerId: string,
  userIndex: number,
) {
  let membersInGroup = await getMembersFromDB(transaction, groupId);

  if (userIndex >= membersInGroup.length) {
    throw new Error("invalid user index");
  }

  for (let member of membersInGroup) {
    if (member.userIndex === 0 && member.userId !== ownerId) {
      throw new Error("only owner can remove admins from group");
    }
    if (member.userIndex === userIndex) {
      if (member.isAdmin) {
        transaction
          .update(membersTable)
          .set({ isAdmin: false })
          .where(
            and(
              eq(membersTable.groupId, groupId),
              eq(membersTable.userId, ownerId),
            ),
          );
      }
    }
  }
}

export async function getMultipleGroupsFromDB(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  groupIds: string[],
) {
  let groups = await transaction
    .select()
    .from(groupsTable)
    .where(inArray(groupsTable.id, groupIds));

  if (groups.length == 0) {
    throw new Error("Invalid Group Id");
  }
  return groups;
}

export async function getMembersFromDB(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  groupId: string,
) {
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

  return members;
}

export async function getUserInfoForMembers(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  members: any[],
) {
  let regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  let userIds = members
    .filter((member) => regex.test(member.userId))
    .map((member) => member.userId);

  let allUserInfo = await getMultipleUserFromDB(transaction, userIds);
  return allUserInfo;
}

export async function addUserInfoToMembers(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  members: any[],
  allUserInfo: any[],
) {
  let membersWithUserInfo: any = [];
  let userInfoMap = new Map();
  for (let user of allUserInfo) {
    userInfoMap.set(user.id, user);
  }

  for (let member of members) {
    let user = userInfoMap.get(member.userId);
    membersWithUserInfo.push({
      ...member,
      avatarUrl: user != undefined ? user.avatar_url : null,
      username: user != undefined ? user.username : null,
    });
  }

  return membersWithUserInfo;
}

export async function deleteGroupInDB(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  groupId: string,
) {
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
  return groupId;
}

export async function getGroupBillsFromDB(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  groupId: string,
  pageSize: number,
  page: number,
) {
  let bills: any = [];
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
