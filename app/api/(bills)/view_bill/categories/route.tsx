import { NextResponse } from "next/server";
import { fetchBillsCategoryWise } from "../../utils";

export const POST = async (request: Request) => {
  try {
    const { groupId, from, to } = await request.json();

    if (!groupId) {
      throw new Error("GroupId is Required");
    }

    const categoryData = await fetchBillsCategoryWise(groupId, from, to);

    return NextResponse.json(categoryData, { status: 200 });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Something went Wrong";
    const statusCode = err instanceof Error ? 400 : 500;
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
};
