import { client, db } from "@/database/dbConnect";
import {
  billsTable,
  draweesInBillsTable,
  groupsTable,
  membersTable,
  payeesInBillsTable,
  transactionsTable,
} from "@/database/schema";
import { eq, sql } from "drizzle-orm";

export async function createBillInDB(requestData: any) {
  let bill: any = {};

  // CREATE BILL FUNCTION
  // 1. FOR ALL DRAWEES ADD THE AMOUNT TO TOTAL SPENT IN MEMBERS TABLE
  // 2. FOR ALL PAYEES ADD THE AMOUNT TO TOTAL PAID IN MEMBERS TABLE
  // 3. CREATE A USERS EXPENSE MAP AS TO HOW MUCH DOES EACH USER HAS SPENT FOR THE BILL
  // 4. CREATE BALANCES AS TO HOW MUCH EACH DRAWING USER MUST PAY TO THE PAYING USER
  // 5. UPDATE BALANCES IN TRANSACTIONS TABLE
  // 6. UPDATE THE TOTAL AMOUNT IN GROUP EXPENSES

  await db.transaction(async (transaction) => {
    let groupId = requestData.group_id;

    // Validate Group Exists
    let groups = await transaction
      .select()
      .from(groupsTable)
      .where(eq(groupsTable.id, groupId));

    if (groups.length === 0) {
      throw new Error("No Such Group Exists");
    }

    const members = await transaction
      .select()
      .from(membersTable)
      .where(eq(membersTable.groupId, groupId));

    // Updating the Members based on the Drawees and Payees in Request
    members.forEach((user) => {
      if (user.userIndex != null) {
        if (requestData.drawees[user.userIndex] !== undefined) {
          user.totalSpent = (
            parseFloat(user.totalSpent) + requestData.drawees[user.userIndex]
          ).toString();
        }
        if (requestData.payees[user.userIndex] !== undefined) {
          user.totalPaid = (
            parseFloat(user.totalPaid) + requestData.payees[user.userIndex]
          ).toString();
        }
      }
    });

    // Create userExpenseMap which stores the amount for each user
    let userExpenseMap = new Map();
    let totalAmount = createUserExpenseMap(
      userExpenseMap,
      requestData,
      members,
    );

    // Update the Members for Group
    members.forEach(async (user) => {
      await transaction
        .update(membersTable)
        .set({ totalSpent: user.totalSpent, totalPaid: user.totalPaid })
        .where(eq(membersTable.userId, user.userId));
    });
    bill.members = members;

    // Create a New Bill in the Database
    const newBill = {
      name: requestData.name,
      notes: requestData.notes,
      amount: totalAmount.toString(),
      category: requestData.category,
      is_payment: requestData.hasOwnProperty("is_payment")
        ? requestData.is_payment
        : false,
      created_at: requestData.hasOwnProperty("created_at")
        ? requestData.created_at
        : Date.now(),
      groupId: groupId,
    };
    let bills = await transaction
      .insert(billsTable)
      .values(newBill)
      .returning();
    bill.bill_id = bills[0].id;

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
    // bill.drawees = drawees;
    // bill.payees = payees;

    // Create Drawees and Payees in DB
    await transaction.insert(draweesInBillsTable).values(drawees);
    await transaction.insert(payeesInBillsTable).values(payees);

    // Update GroupTotalExpense
    if (bills[0].isPayment === false) {
      let groups = await transaction
        .update(groupsTable)
        .set({
          totalExpense: sql`${groupsTable.totalExpense} + ${totalAmount.toString()}`,
        })
        .where(eq(groupsTable.id, groupId))
        .returning();
      bill.total_group_expense = groups[0].totalExpense;
    }
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
      .from(draweesInBillsTable)
      .where(eq(draweesInBillsTable.billId, billId));
    bill.payees = await transaction
      .select()
      .from(payeesInBillsTable)
      .where(eq(payeesInBillsTable.billId, billId));

    bill.bill = bills[0];
  });
  return bill;
}

export async function deleteBillInDB(requestData: any) {
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

    let groupId = bills[0].groupId;

    const members = await transaction
      .select()
      .from(membersTable)
      .where(eq(membersTable.groupId, groupId as string));

    requestData.drawees = {};
    requestData.payees = {};

    let drawees = await transaction
      .select()
      .from(draweesInBillsTable)
      .where(eq(draweesInBillsTable.billId, billId));

    for (let drawee of drawees) {
      requestData.drawees[drawee.userIndex] = "-" + drawee.amount;
    }

    let payees = await transaction
      .select()
      .from(payeesInBillsTable)
      .where(eq(payeesInBillsTable.billId, billId));

    for (let payee of payees) {
      requestData.payees[payee.userIndex] = "-" + payee.amount;
    }

    // Updating the Members based on the Drawees and Payees in DB
    members.forEach((user) => {
      if (user.userIndex != null) {
        if (requestData.drawees[user.userIndex] !== undefined) {
          user.totalSpent = (
            parseFloat(user.totalSpent) +
            parseFloat(requestData.drawees[user.userIndex])
          ).toString();
        }
        if (requestData.payees[user.userIndex] !== undefined) {
          user.totalPaid = (
            parseFloat(user.totalPaid) +
            parseFloat(requestData.payees[user.userIndex])
          ).toString();
        }
      }
    });

    // Create userExpenseMap which stores the amount for each user
    let userExpenseMap = new Map();
    let totalAmount = createUserExpenseMap(
      userExpenseMap,
      requestData,
      membersTable,
    );

    // Update the Members for Group
    members.forEach(async (user) => {
      await transaction
        .update(membersTable)
        .set({ totalSpent: user.totalSpent, totalPaid: user.totalPaid })
        .where(eq(membersTable.userId, user.userId));
    });
    bill.members = members;

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
      let groups = await transaction
        .update(groupsTable)
        .set({
          totalExpense: sql`${groupsTable.totalExpense} + ${totalAmount.toString()}`,
        })
        .where(eq(groupsTable.id, groupId as string))
        .returning();
      bill.total_group_expense = groups[0].totalExpense;
    }
  });

  return bill;
}

function createUserExpenseMap(
  userExpenseMap: Map<number, number>,
  requestData: any,
  members: any,
) {
  let totalDrawn = 0,
    totalPaid = 0;

  for (let [idx, amt] of Object.entries(requestData.drawees)) {
    let index = parseFloat(idx),
      amount = parseFloat(amt as string);
    if (index >= members.length) {
      throw new Error("Drawees Index must be less than Member's Length");
    }
    totalDrawn += amount;
    userExpenseMap.set(index, -1 * amount);
  }

  for (let [idx, amt] of Object.entries(requestData.payees)) {
    let index = parseFloat(idx),
      amount = parseFloat(amt as string);
    if (index >= members.length) {
      throw new Error("Payees Index must be less than Member's Length");
    }
    totalPaid += amount;
    if (userExpenseMap.get(index) === undefined) {
      userExpenseMap.set(index, amount);
    } else {
      userExpenseMap.set(index, amount + userExpenseMap.get(index)!);
    }
  }

  // console.log(totalDrawn);
  // console.log(totalPaid);

  if (totalDrawn != totalPaid) {
    throw new Error("Drawn and Paid Amount mismatch");
  }

  return totalPaid;
}

function createBalances(userExpenseMap: Map<number, number>, groupId: any) {
  let negMap = new Map(),
    posMap = new Map();
  let balances = [];
  for (let [idx, amt] of userExpenseMap.entries()) {
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
