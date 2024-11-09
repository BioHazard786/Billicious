import { NextResponse } from "next/server";
import { sendInvite, senderAndReceiverValidationInGroup } from "../utils";
import { db } from "@/database/dbConnect";
import { getUserFromDB, getUserFromDBViaUsername } from "../../(users)/utils";
import { getMembersFromDB } from "../../(groups)/utils";

export const POST = async (request: Request) => {
  try {
    const requestData = await request.json();
    if (requestData.senderUserId === undefined) {
      throw new Error("sender user id is required");
    }
    if (requestData.receiverUsername === undefined) {
      throw new Error("receiver user name is required");
    }
    if (requestData.groupId === undefined) {
      throw new Error("group id is required");
    }
    if (requestData.userIndex === undefined) {
      throw new Error("user index is required");
    }

    await db.transaction(async (transaction) => {
      let sender = await getUserFromDB(transaction, requestData.senderUserId);
      let receiver = await getUserFromDBViaUsername(
        transaction,
        requestData.receiverUsername,
      );
      let members = await getMembersFromDB(transaction, requestData.groupId);
      if (
        await senderAndReceiverValidationInGroup(
          transaction,
          members,
          sender.id,
          receiver.id,
          requestData.userIndex,
          false,
          false,
        )
      ) {
        await sendInvite(
          transaction,
          requestData.groupId,
          requestData.senderUserId,
          receiver.id,
          requestData.userIndex,
        );
      }
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

  return NextResponse.json({ message: "Invite Sent" }, { status: 201 });
};
