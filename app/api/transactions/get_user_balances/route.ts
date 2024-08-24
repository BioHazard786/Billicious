import { client, db } from "@/database/dbConnect";
import { transactionsTable } from "@/database/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  let balances;
  try {
    await db.transaction(async (transaction) => {
      const requestData = await request.json();
      let groupId = requestData.group_id;
      let userIndex = requestData.user_index;

      balances = await transaction
        .select()
        .from(transactionsTable)
        .where(
          and(
            eq(transactionsTable.groupId, groupId),
            eq(transactionsTable.user1Index, userIndex),
          ),
        );
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: err }, { status: 400 });
  }
  return NextResponse.json({ transactions: balances }, { status: 200 });
};
