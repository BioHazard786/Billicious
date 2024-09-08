import { NextResponse } from "next/server";
import { addUsersInDB } from "../utils";

export const POST = async (request: Request) => {
  let user;
  try {
    const requestData = await request.json();

    if (requestData.id === undefined) {
      throw new Error("Id is required");
    }
    if (requestData.username === undefined) {
      throw new Error("UserName is required");
    }
    if (requestData.name === undefined) {
      throw new Error("Name is required");
    }
    if (requestData.platform === undefined) {
      throw new Error("Platform is required");
    }

    user = await addUsersInDB(requestData);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Something went Wrong" },
      { status: 500 },
    );
  }

  return NextResponse.json({ user }, { status: 201 });
};
