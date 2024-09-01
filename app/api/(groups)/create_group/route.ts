import { NextResponse } from "next/server";
import { addMembersInDB, createGroupInDB } from "../utils";

export const POST = async (request: Request) => {
  let group: any = {};
  try {
    const requestData = await request.json();
    group.group = await createGroupInDB(requestData);

    let requestCopy = {
      ...requestData,
      group_id: group.group.id,
    };
    // console.log(requestCopy);
    group.users = await addMembersInDB(requestCopy);
  } catch (err) {
    return NextResponse.json(
      { Error: "Something went Wrong" },
      { status: 400 },
    );
  }
  return NextResponse.json({ group }, { status: 200 });
};
