import {
  billsTable,
  draweesInBills,
  groupsTable,
  payeesInBills,
  transactionsTable,
  usersGroupsTable,
} from "@/database/schema";
import { client, db } from "@/database/dbConnect";
import { eq, sql } from "drizzle-orm";
import { error } from "console";

export async function createBillInDB(requestData: any) {
  let bill: any = {};

  await db.transaction(async (transaction) => {
    let groupId = requestData.group_id;

    const usersInGroup = await transaction
      .select()
      .from(usersGroupsTable)
      .where(eq(usersGroupsTable.groupId, groupId));

    // Create UserMap which stores the amount for each user
    let userMap = new Map();
    let totalAmount = createUserMap(userMap, requestData, usersGroupsTable);

    // Updating the UsersGroup based on the UserMap in DB
    usersInGroup.forEach((user) => {
      if (userMap.get(user.userIndex) !== undefined) {
        user.totalAmount = (
          parseFloat(user.totalAmount) + userMap.get(user.userIndex)
        ).toString();
      }
    });
    usersInGroup.forEach(async (user) => {
      await transaction
        .update(usersGroupsTable)
        .set({ totalAmount: user.totalAmount })
        .where(eq(usersGroupsTable.userId, user.userId));
    });

    // Create a New Bill in the Database
    const newBill = {
      name: requestData.name,
      notes: requestData.notes,
      amount: totalAmount.toString(),
      is_payment: requestData.hasOwnProperty("is_payment")
        ? requestData.is_payment
        : false,
      groupId: groupId,
    };
    let bills = await transaction
      .insert(billsTable)
      .values(newBill)
      .returning();
    bill.bill = bills[0];

    // Get all the balances for Users
    const balances = createBalances(userMap, groupId);

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

    // Update Drawees and Payees
    let drawees = [];
    for (let [idx, amt] of Object.entries(requestData.drawees)) {
      drawees.push({
        billId: bills[0].id,
        userIndex: parseInt(idx),
        amount: amt as string,
      });
    }
    let payees = [];
    for (let [idx, amt] of Object.entries(requestData.payees)) {
      payees.push({
        billId: bills[0].id,
        userIndex: parseInt(idx),
        amount: amt as string,
      });
    }
    bill.drawees = drawees;
    bill.payees = payees;

    // Create Drawees and Payees in DB
    await transaction.insert(draweesInBills).values(drawees);
    await transaction.insert(payeesInBills).values(payees);
  });

  return bill;
}

export async function getBillFromDB(requestData: any) {
  let bill: any = {};
  await db.transaction(async (transaction) => {
    let billId = requestData.bill_id;

    let bills = await transaction
      .select()
      .from(billsTable)
      .where(eq(billsTable.id, billId));

    if (bills.length == 0) {
      throw new Error("Invalid Bill Id");
    }

    bill.drawees = await transaction
      .select()
      .from(draweesInBills)
      .where(eq(draweesInBills.billId, billId));
    bill.payees = await transaction
      .select()
      .from(payeesInBills)
      .where(eq(payeesInBills.billId, billId));

    bill.bill = bills[0];
  });
  return bill;
}

export async function deleteBillInDB(requestData: any) {
  let billId;
  await db.transaction(async (transaction) => {
    billId = requestData.bill_id;

    let bills = await transaction
      .select()
      .from(billsTable)
      .where(eq(billsTable.id, billId));

    if (bills.length == 0) {
      throw new Error("Invalid Bill Id");
    }

    let bill = bills[0];
    let groupId = bill.groupId;

    const usersInGroup = await transaction
      .select()
      .from(usersGroupsTable)
      .where(eq(usersGroupsTable.groupId, groupId as unknown as number));

    requestData.drawees = {};
    requestData.payees = {};

    let drawees = await transaction
      .select()
      .from(draweesInBills)
      .where(eq(draweesInBills.billId, billId));

    for (let drawee of drawees) {
      requestData.drawees[drawee.userIndex] = "-" + drawee.amount;
    }

    let payees = await transaction
      .select()
      .from(payeesInBills)
      .where(eq(payeesInBills.billId, billId));

    for (let payee of payees) {
      requestData.payees[payee.userIndex] = "-" + payee.amount;
    }

    // Create UserMap which stores the amount for each user
    let userMap = new Map();
    let totalAmount = createUserMap(userMap, requestData, usersGroupsTable);

    // Updating the UsersGroup based on the UserMap in DB
    usersInGroup.forEach((user) => {
      if (userMap.get(user.userIndex) !== undefined) {
        user.totalAmount = (
          parseFloat(user.totalAmount) + userMap.get(user.userIndex)
        ).toString();
      }
    });
    usersInGroup.forEach(async (user) => {
      await transaction
        .update(usersGroupsTable)
        .set({ totalAmount: user.totalAmount })
        .where(eq(usersGroupsTable.userId, user.userId));
    });

    // Get all the balances for Users
    const balances = createBalances(userMap, groupId);

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

    // Delete Drawees and Payees in DB
    await transaction
      .delete(draweesInBills)
      .where(eq(draweesInBills.billId, billId));
    await transaction
      .delete(payeesInBills)
      .where(eq(payeesInBills.billId, billId));

    // Delete the Bill
    await transaction.delete(billsTable).where(eq(billsTable.id, billId));
  });

  return billId;
}

function createUserMap(
  userMap: Map<number, number>,
  requestData: any,
  usersInGroup: any,
) {
  let totalDrawn = 0,
    totalPaid = 0;

  for (let [idx, amt] of Object.entries(requestData.drawees)) {
    let index = parseInt(idx),
      amount = parseInt(amt as string);
    if (index >= usersInGroup.length) {
      throw new Error("User Index Error");
    }
    totalDrawn += amount;
    userMap.set(index, -1 * amount);
  }

  for (let [idx, amt] of Object.entries(requestData.payees)) {
    let index = parseInt(idx),
      amount = parseInt(amt as string);
    if (index >= usersInGroup.length) {
      throw new Error("User Index Error");
    }
    totalPaid += amount;
    if (userMap.get(index) === undefined) {
      userMap.set(index, amount);
    } else {
      userMap.set(index, amount + userMap.get(index)!);
    }
  }

  if (totalDrawn != totalPaid) {
    throw new Error("Drawn and Paid Amount mismatch");
  }

  return totalPaid;
}

function createBalances(userMap: Map<number, number>, groupId: any) {
  let negMap = new Map(),
    posMap = new Map();
  let balances = [];
  for (let [idx, amt] of userMap.entries()) {
    if (amt < 0) negMap.set(idx, amt);
    else if (amt > 0) posMap.set(idx, amt);
  }

  // console.log(negMap);
  // console.log(posMap);
  // console.log(negMap.size);
  // console.log(posMap.size);

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
