import { NextResponse } from "next/server";
import { fetchBillsYearWise } from "../../utils";

export const POST = async (request: Request) => {
  try {
    const { groupId, from, to } = await request.json();

    if (!groupId) {
      throw new Error("GroupId is Required");
    }

    const timelineData = await fetchBillsYearWise(groupId, from, to);

    return NextResponse.json(timelineData, { status: 200 });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Something went Wrong";
    const statusCode = err instanceof Error ? 400 : 500;
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
};
