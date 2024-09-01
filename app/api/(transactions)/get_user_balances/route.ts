import { client, db } from "@/database/dbConnect";
import { transactionsTable } from "@/database/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getUserBalancesFromDB } from "../utils";

export const POST = async (request: Request) => {
  let balances;
  try {
    const requestData = await request.json();

    if (requestData.group_id === undefined) {
      throw new Error("Group Id is Required");
    }
    if (requestData.user_index === undefined) {
      throw new Error("User Index is Required");
    }

    balances = await getUserBalancesFromDB(requestData);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Something went Wrong" },
      { status: 500 },
    );
  }
  return NextResponse.json(balances, { status: 200 });
};
