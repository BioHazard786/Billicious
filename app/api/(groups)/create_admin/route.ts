import { db } from "@/database/dbConnect";
import { NextResponse } from "next/server";
import { createAdmin } from "../utils";

export const POST = async (request: Request) => {
  try {
    const requestData = await request.json();
    if (requestData.groupId === undefined) {
      throw new Error("GroupId is required");
    }
    if (requestData.ownerId === undefined) {
      throw new Error("owner Id is required");
    }
    if (requestData.userIndex === undefined) {
      throw new Error("user index is required");
    }

    await db.transaction(async (transaction) => {
      await createAdmin(
        transaction,
        requestData.groupId,
        requestData.ownerId,
        requestData.userIndex,
      );
    });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Something went Wrong" },
      { status: 500 },
    );
  }

  return NextResponse.json("Admin Created", { status: 200 });
};
