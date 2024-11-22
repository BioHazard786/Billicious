import { db } from "@/database/dbConnect";
import { NextResponse } from "next/server";
import { getUserFromDB } from "../../(users)/utils";
import { getGroupFromDB } from "../utils";

interface RequestData {
  groupId?: string;
  userId?: string;
}

export const POST = async (request: Request) => {
  try {
    const requestData: RequestData = await request.json();

    if (!requestData.groupId || !requestData.userId) {
      return NextResponse.json(
        { error: "Both group ID and user ID are required" },
        { status: 400 },
      );
    }

    const [group, user] = await db.transaction((transaction) =>
      Promise.all([
        getGroupFromDB(transaction, requestData.groupId!),
        getUserFromDB(transaction, requestData.userId!),
      ]),
    );

    return NextResponse.json({ group, user }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong" },
      { status: 500 },
    );
  }
};
