import { updateBatch } from "@/src/util/institute/batchControllers";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { batchID, title, tags } = await request.json();

    if (!batchID || !title) {
      return NextResponse.json(
        { success: false, message: "Batch ID and title are required" },
        { status: 400 }
      );
    }

    const result = await updateBatch({ batchID, title, tags });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Update Batch API error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
