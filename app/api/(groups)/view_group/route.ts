import { NextResponse } from "next/server";
import { getGroupFromDB, getMembersFromDB } from "../utils";

export const POST = async (request: Request) => {
  let group: any = {};
  try {
    const requestData = await request.json();
    group.group = await getGroupFromDB(requestData);

    let requestCopy = {
      ...requestData,
      group_id: group.group.id,
    };
    // console.log(requestCopy);
    group.users = await getMembersFromDB(requestCopy);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "Something went Wrong" },
      { status: 400 },
    );
  }
  return NextResponse.json({ group }, { status: 200 });
};
