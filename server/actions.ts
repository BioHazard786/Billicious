"use server";

import { dbConnect } from "@/lib/dbConnect";
import { TMembers, TransactionT } from "@/lib/types";
import Group from "@/models/groupModel";
import Transaction from "@/models/transactionModel";
import { nanoid } from "nanoid";

export async function createGroupInDB({
  groupName,
  memberNames,
}: {
  groupName: string;
  memberNames: string[];
}) {
  await dbConnect();

  const groupId = nanoid(15);
  // const members = {};
  // for (let memberName of memberNames) {
  //   members[nanoid(10)] = {
  //     name: memberName,
  //     expenses: 0.0,
  //     memberBills: {},
  //   };
  // }
  const members: TMembers[] = memberNames.map((memberName) => ({
    name: memberName,
    memberId: nanoid(10),
    expenses: 0.0,
    memberBills: {},
  }));
  try {
    const newGroup = new Group({
      members: members,
      _id: groupId,
      name: groupName,
    });

    const savedGroup = await newGroup.save();
    return JSON.stringify(savedGroup);
  } catch (error) {
    throw error;
  }
}

export async function fetchGroupById(groupId: string) {
  await dbConnect();

  try {
    const group = await Group.findById(groupId);
    if (group) return JSON.stringify(group);
    else throw new Error("Group not found");
  } catch (error) {
    throw error;
  }
}

export async function createTransactionInDB(transactionData: TransactionT) {
  await dbConnect();

  const transactionId = nanoid(12);
  transactionData._id = transactionId;
  const group = await Group.findById(transactionData.groupId);
  if (!group) throw new Error("Group not found");
  try {
    const newTransaction = new Transaction(transactionData);
    await newTransaction.save();
  } catch (error) {
    throw error;
  }

  for (let member of group.members) {
  }
}
