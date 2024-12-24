import { createClient } from "@/auth-utils/server";
import {
  billsTable,
  draweesInBillsTable,
  groupsTable,
  inviteTable,
  membersTable,
  payeesInBillsTable,
  transactionsTable,
} from "@/database/schema";
import {
  and,
  desc,
  eq,
  ExtractTablesWithRelations,
  gte,
  inArray,
  lte,
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
        await transaction
          .update(membersTable)
          .set({ isAdmin: true })
          .where(
            and(
              eq(membersTable.groupId, groupId),
              eq(membersTable.userIndex, userIndex),
            ),
          );

        break;
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
              eq(membersTable.userIndex, userIndex),
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
      avatarUrl: user != undefined ? user.avatarUrl : null,
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
  const supabase = createClient();
  // Fetch bills and their IDs in a single query
  const bills = await transaction
    .select({ id: billsTable.id })
    .from(billsTable)
    .where(eq(billsTable.groupId, groupId));

  const backgroundUrl = await transaction
    .select({ backgroundUrl: groupsTable.backgroundUrl })
    .from(groupsTable)
    .where(eq(groupsTable.id, groupId))
    .limit(1);

  const billIds = bills.map((bill) => bill.id);

  // Building the promises array
  const promises: Promise<any>[] = [
    // Delete related bill entities in parallel
    transaction
      .delete(draweesInBillsTable)
      .where(inArray(draweesInBillsTable.billId, billIds)),
    transaction
      .delete(payeesInBillsTable)
      .where(inArray(payeesInBillsTable.billId, billIds)),

    // Delete other group-related entities
    transaction
      .delete(transactionsTable)
      .where(eq(transactionsTable.groupId, groupId)),
    transaction.delete(membersTable).where(eq(membersTable.groupId, groupId)),
    transaction.delete(billsTable).where(eq(billsTable.groupId, groupId)),
    transaction.delete(inviteTable).where(eq(inviteTable.groupId, groupId)),
    transaction.delete(groupsTable).where(eq(groupsTable.id, groupId)),
  ];

  if (backgroundUrl.length > 0 && backgroundUrl[0].backgroundUrl) {
    promises.push(
      supabase.storage
        .from("group_cover_image")
        .remove([backgroundUrl[0].backgroundUrl]),
    );
  }

  // Perform bulk deletes in parallel
  await Promise.all(promises);

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
  from?: string,
  to?: string,
) {
  return await withPagination(
    transaction
      .select()
      .from(billsTable)
      .where(
        and(
          eq(billsTable.groupId, groupId),
          ...(from ? [gte(billsTable.createdAt, new Date(from))] : []),
          ...(to ? [lte(billsTable.createdAt, new Date(to))] : []),
        ),
      )
      .orderBy(desc(billsTable.createdAt))
      .$dynamic(),
    page,
    pageSize,
  );

  // console.log(billsFromDB);

  // for (let bill of billsFromDB) {
  //   let drawees = await transaction
  //     .select()
  //     .from(draweesInBillsTable)
  //     .where(eq(draweesInBillsTable.billId, bill.id));
  //   let payees = await transaction
  //     .select()
  //     .from(payeesInBillsTable)
  //     .where(eq(payeesInBillsTable.billId, bill.id));

  //   bills.push({
  //     ...bill,
  //     drawees: drawees,
  //     payees: payees,
  //   });
  //   // console.log(bills);
  // }
}

export function withPagination<T extends PgSelect>(
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
