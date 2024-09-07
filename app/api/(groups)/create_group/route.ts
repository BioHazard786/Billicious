import { NextResponse } from "next/server";
import { addMembersInDB, createGroupInDB } from "../utils";

export const POST = async (request: Request) => {
  let group: any = {};
  try {
    const requestData = await request.json();

    if (requestData.name === undefined) {
      throw new Error("Group Name is Required");
    }
    if (requestData.members === undefined || requestData.members.length === 0) {
      throw new Error("Members are Required");
    }

    group.group = await createGroupInDB(requestData);
    let requestCopy = {
      ...requestData,
      group_id: group.group.id,
    };
    // console.log(requestCopy);
    group.members = await addMembersInDB(requestCopy);
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
