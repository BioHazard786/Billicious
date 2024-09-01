import { NextResponse } from "next/server";
import { getAllBalancesFromDB } from "../utils";

export const POST = async (request: Request) => {
  let balances;
  try {
    const requestData = await request.json();
    balances = await getAllBalancesFromDB(requestData);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Something went Wrong" },
      { status: 400 },
    );
  }
  return NextResponse.json(balances, { status: 200 });
};
