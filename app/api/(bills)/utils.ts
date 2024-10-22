import { client, db } from "@/database/dbConnect";
import {
  billsTable,
  draweesInBillsTable,
  groupsTable,
  membersTable,
  payeesInBillsTable,
  transactionsTable,
} from "@/database/schema";
import { eq, ExtractTablesWithRelations, sql } from "drizzle-orm";
import { PgTransaction } from "drizzle-orm/pg-core";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import { getGroupFromDB, getMembersFromDB } from "../(groups)/utils";
// import { CompressionTypes } from "kafkajs";
// import { redpanda } from "@/database/kafka";
// const producer = redpanda.producer();

export async function createBillInDB(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  groupId: string,
  drawees: any[],
  payees: any[],
  name: string,
  notes: string,
  category: string,
  isPayment: boolean,
  createdAt: Date,
) {
  let bill: any = {};

  // CREATE BILL FUNCTION
  // 1. FOR ALL DRAWEES ADD THE AMOUNT TO TOTAL SPENT IN MEMBERS TABLE
  // 2. FOR ALL PAYEES ADD THE AMOUNT TO TOTAL PAID IN MEMBERS TABLE
  // 3. CREATE A USERS EXPENSE MAP AS TO HOW MUCH DOES EACH USER HAS SPENT FOR THE BILL
  // 4. CREATE BALANCES AS TO HOW MUCH EACH DRAWING USER MUST PAY TO THE PAYING USER
  // 5. UPDATE BALANCES IN TRANSACTIONS TABLE
  // 6. UPDATE THE TOTAL AMOUNT IN GROUP EXPENSES

  // Validate Group Exists
  await getGroupFromDB(transaction, groupId);

  const members = await getMembersFromDB(transaction, groupId);

  let totalAmount = validateDraweesAndPayees(drawees, payees, members.length);

  // Create a New Bill in the Database
  const newBill = {
    name: name,
    notes: notes,
    amount: totalAmount.toString(),
    category: category,
    isPayment: isPayment,
    createdAt: createdAt,
    groupId: groupId,
  };
  let bills = await transaction.insert(billsTable).values(newBill).returning();
  bill.bill_id = bills[0].id;

  bill.members = await updateMembersAndBalances(
    transaction,
    groupId as string,
    members,
    drawees,
    payees,
  );

  // Update Drawees and Payees
  let draweesInBill = [];
  for (let [idx, amt] of Object.entries(drawees)) {
    draweesInBill.push({
      billId: bills[0].id,
      userIndex: parseInt(idx),
      amount: amt as string,
    });
  }
  let payeesInBill = [];
  for (let [idx, amt] of Object.entries(payees)) {
    payeesInBill.push({
      billId: bills[0].id,
      userIndex: parseInt(idx),
      amount: amt as string,
    });
  }

  // Create Drawees and Payees in DB
  bill.drawees = await transaction
    .insert(draweesInBillsTable)
    .values(draweesInBill)
    .returning();
  bill.payees = await transaction
    .insert(payeesInBillsTable)
    .values(payeesInBill)
    .returning();

  // Update GroupTotalExpense
  if (bills[0].isPayment === false) {
    bill.totalGroupExpense = await updateGroup(
      transaction,
      groupId,
      totalAmount,
    );
  }

  // sendBillDataToKafka(bill, groupId);

  return bill;
}

export async function getBillFromDB(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  billId: string,
) {
  let bill: any = {};
  let bills = await transaction
    .select()
    .from(billsTable)
    .where(eq(billsTable.id, billId));

  if (bills.length == 0) {
    throw new Error("Invalid Bill Id");
  }

  bill.drawees = await transaction
    .select()
    .from(draweesInBillsTable)
    .where(eq(draweesInBillsTable.billId, billId));
  bill.payees = await transaction
    .select()
    .from(payeesInBillsTable)
    .where(eq(payeesInBillsTable.billId, billId));

  bill.bill = bills[0];
  return bill;
}

export async function deleteBillInDB(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  billId: string,
) {
  let bill: any = {};
  let bills = await transaction
    .select()
    .from(billsTable)
    .where(eq(billsTable.id, billId));

  if (bills.length == 0) {
    throw new Error("Invalid Bill Id");
  }

  let groupId = bills[0].groupId;

  const members = await getMembersFromDB(transaction, groupId as string);

  let totalDrawn = 0,
    totalPaid = 0;

  let draweesInBill = await transaction
    .select()
    .from(draweesInBillsTable)
    .where(eq(draweesInBillsTable.billId, billId));

  let drawees: any = [];
  for (let drawee of draweesInBill) {
    drawees[drawee.userIndex] = "-" + drawee.amount;
    totalDrawn -= parseFloat(drawee.amount as string);
  }

  let payees: any = [];
  let payeesInBill = await transaction
    .select()
    .from(payeesInBillsTable)
    .where(eq(payeesInBillsTable.billId, billId));

  for (let payee of payeesInBill) {
    payees[payee.userIndex] = "-" + payee.amount;
    totalPaid -= parseFloat(payee.amount as string);
  }

  let totalAmount = totalPaid;

  bill.members = await updateMembersAndBalances(
    transaction,
    groupId as string,
    members,
    drawees,
    payees,
  );

  // Delete Drawees and Payees in DB
  await transaction
    .delete(draweesInBillsTable)
    .where(eq(draweesInBillsTable.billId, billId));
  await transaction
    .delete(payeesInBillsTable)
    .where(eq(payeesInBillsTable.billId, billId));

  // Delete the Bill
  await transaction.delete(billsTable).where(eq(billsTable.id, billId));

  // Update GroupTotalExpense
  if (bills[0].isPayment === false) {
    bill.totalGroupExpense = await updateGroup(
      transaction,
      groupId as string,
      totalAmount,
    );
  }

  // sendBillDataToKafka(bill, groupId as string);

  return bill;
}

async function updateGroup(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  groupId: string,
  totalAmount: number,
) {
  let groups = await transaction
    .update(groupsTable)
    .set({
      totalExpense: sql`${groupsTable.totalExpense} + ${totalAmount.toString()}`,
    })
    .where(eq(groupsTable.id, groupId))
    .returning();
  return groups[0].totalExpense;
}

async function updateMembersAndBalances(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  groupId: string,
  members: any[],
  drawees: any[],
  payees: any[],
) {
  // Updating the Members based on the Drawees and Payees in DB
  members.forEach((user) => {
    if (user.userIndex != null) {
      if (drawees[user.userIndex] !== undefined) {
        user.totalSpent = (
          parseFloat(user.totalSpent) + parseFloat(drawees[user.userIndex])
        ).toString();
      }
      if (payees[user.userIndex] !== undefined) {
        user.totalPaid = (
          parseFloat(user.totalPaid) + parseFloat(payees[user.userIndex])
        ).toString();
      }
    }
  });

  // Create userExpenseMap which stores the amount for each user
  let userExpenseMap = createUserExpenseMap(drawees, payees);

  // Update the Members for Group
  members.forEach(async (user) => {
    await transaction
      .update(membersTable)
      .set({ totalSpent: user.totalSpent, totalPaid: user.totalPaid })
      .where(eq(membersTable.userId, user.userId));
  });
  members = members.sort(
    (i, j) => (i.userIndex as number) - (j.userIndex as number),
  );

  // Get all the balances for Users
  const balances = createBalances(userExpenseMap, groupId);

  // Update the balances for Users in DB
  balances.forEach(async (balance) => {
    await transaction
      .insert(transactionsTable)
      .values(balance)
      .onConflictDoUpdate({
        target: [
          transactionsTable.groupId,
          transactionsTable.user1Index,
          transactionsTable.user2Index,
        ],
        set: {
          balance: sql`${transactionsTable.balance} + ${balance.balance}`,
        },
      });
  });
  return members;
}

function validateDraweesAndPayees(
  drawees: any[],
  payees: any[],
  membersLength: number,
) {
  let totalDrawn = 0,
    totalPaid = 0;

  // CHECK IF EACH DRAWEE INDEX IS LESS THAN MEMBERS' LENGTH
  // ADD EACH DRAWEE AMOUNT TO TOTALDRAWN
  for (let [idx, amt] of Object.entries(drawees)) {
    let index = parseFloat(idx),
      amount = parseFloat(amt as string);
    if (index >= membersLength) {
      throw new Error("drawees index must be less than member's length");
    }
    totalDrawn += amount;
  }

  // CHECK IF EACH PAYEE INDEX IS LESS THAN MEMBERS' LENGTH
  // ADD EACH PAYEE AMOUNT TO TOTALPAID
  for (let [idx, amt] of Object.entries(payees)) {
    let index = parseFloat(idx),
      amount = parseFloat(amt as string);
    if (index >= membersLength) {
      throw new Error("payees index must be less than member's length");
    }
    totalPaid += amount;
  }

  // CHECK IF TOTALPAID AMOUNT IS EQUAL TO TOTAL DRAWN AMOUNT
  if (totalDrawn != totalPaid) {
    throw new Error("drawn and paid amount mismatch");
  }
  return totalPaid;
}

function createUserExpenseMap(drawees: any[], payees: any[]) {
  let userExpenseMap: Map<number, number> = new Map();
  for (let [idx, amt] of Object.entries(drawees)) {
    let index = parseFloat(idx),
      amount = parseFloat(amt as string);
    userExpenseMap.set(index, -1 * amount);
  }

  for (let [idx, amt] of Object.entries(payees)) {
    let index = parseFloat(idx),
      amount = parseFloat(amt as string);
    if (userExpenseMap.get(index) === undefined) {
      userExpenseMap.set(index, amount);
    } else {
      userExpenseMap.set(index, amount + userExpenseMap.get(index)!);
    }
  }

  return userExpenseMap;
}

function createBalances(userExpenseMap: Map<number, number>, groupId: any) {
  let negMap = new Map(),
    posMap = new Map();
  let balances = [];
  for (let [idx, amt] of userExpenseMap.entries()) {
    if (amt < 0) negMap.set(idx, amt);
    else if (amt > 0) posMap.set(idx, amt);
  }

  let i = 0,
    j = 0;

  let posMapKeys = Array.from(posMap.keys());
  let negMapKeys = Array.from(negMap.keys());
  let curNegIdx = 0,
    curPosIdx = 0,
    curNegAmt = 0,
    curPosAmt = 0;

  while (i < posMap.size && j < negMap.size) {
    curNegIdx = negMapKeys[j];
    curNegAmt = negMap.get(curNegIdx);

    curPosIdx = posMapKeys[i];
    curPosAmt = posMap.get(curPosIdx);

    let mn = Math.min(-1 * curNegAmt, curPosAmt);

    curPosAmt -= mn;
    curNegAmt += mn;
    balances.push({
      groupId: groupId,
      user1Index: curPosIdx,
      user2Index: curNegIdx,
      balance: mn.toString(),
    });

    balances.push({
      groupId: groupId,
      user1Index: curNegIdx,
      user2Index: curPosIdx,
      balance: (-1 * mn).toString(),
    });

    while (curNegAmt == 0) {
      ++j;
      curNegIdx = negMapKeys[j];
      curNegAmt = negMap.get(curNegIdx);
    }
    while (curPosAmt == 0) {
      ++i;
      curPosIdx = posMapKeys[i];
      curPosAmt = posMap.get(curPosIdx);
    }
  }

  return balances;
}

// export async function sendBillDataToKafka(bill: any, groupId: string) {
//   const sendMessage = (msg: string) => {
//     return producer
//       .send({
//         topic: "billicious",
//         compression: CompressionTypes.GZIP,
//         messages: [
//           {
//             // Messages with the same key are sent to the same topic partition for
//             // guaranteed ordering
//             key: groupId,
//             value: JSON.stringify(msg),
//           },
//         ],
//       })
//       .catch((e: { message: any }) => {
//         throw new Error(e.message);
//       });
//   };

//   await producer.connect();
//   let response = await sendMessage(bill);
//   if (response === null) {
//     throw new Error("unable to send message");
//   }
// }
