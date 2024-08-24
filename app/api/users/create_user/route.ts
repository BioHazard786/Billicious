import { client, db } from "@/database/dbConnect";
import { usersTable } from "@/database/schema";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  let userId;
  try {
    await db.transaction(async (transaction) => {
      const requestData = await request.json();
      const newUser = {
        name: requestData.name,
        username: requestData.username,
      };

      userId = await transaction
        .insert(usersTable)
        .values(newUser)
        .returning({ id: usersTable.id });
    });
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 400 });
  }

  return NextResponse.json({ UserId: userId }, { status: 201 });
};
