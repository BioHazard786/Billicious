import { client, db } from "@/database/dbConnect";
import { groupsTable } from "@/database/schema";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  let groupId;
  try {
    await db.transaction(async (transaction) => {
      const requestData = await request.json();
      const newGroup = {
        name: requestData.name,
      };

      groupId = await transaction
        .insert(groupsTable)
        .values(newGroup)
        .returning({ id: groupsTable.id });
    });
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 400 });
  }
  return NextResponse.json({ groupId: groupId }, { status: 201 });
};
