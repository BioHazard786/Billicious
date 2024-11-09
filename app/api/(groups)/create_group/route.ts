import { NextResponse } from "next/server";
import { addMembersInDB, createGroupInDB } from "../utils";
import { getUserFromDB } from "../../(users)/utils";
import { db } from "@/database/dbConnect";

export const POST = async (request: Request) => {
  let group: any = {};
  try {
    const requestData = await request.json();

    if (requestData.name === undefined) {
      throw new Error("group name is Required");
    }
    if (requestData.ownerId === undefined) {
      throw new Error("ownerId is required");
    }

    await db.transaction(async (transaction) => {
      let groupData = await createGroupInDB(
        transaction,
        requestData.name,
        requestData.backgroundUrl,
        requestData.currencyCode,
      );
      let members = await addMembersInDB(
        transaction,
        groupData.id,
        true,
        requestData.ownerId,
        requestData.members,
        requestData.usernames,
      );
      group = {
        group: groupData,
        members: members,
      };
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
  return NextResponse.json(group, { status: 200 });
};
