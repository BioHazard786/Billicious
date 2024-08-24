import { client, db } from "@/database/dbConnect";
import { transactionsTable } from "@/database/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getUserBalancesFromDB } from "../utils";

export const POST = async (request: Request) => {
  let balances;
  try {
    const requestData = await request.json();
    balances = await getUserBalancesFromDB(requestData);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: err }, { status: 400 });
  }
  return NextResponse.json({ transactions: balances }, { status: 200 });
};
