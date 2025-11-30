import { deleteBatch } from "@/src/util/institute/batchControllers";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { batchID } = await request.json();

    if (!batchID) {
      return NextResponse.json(
        { success: false, message: "Batch ID is required" },
        { status: 400 }
      );
    }

    const result = await deleteBatch({ batchID });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Delete Batch API error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
