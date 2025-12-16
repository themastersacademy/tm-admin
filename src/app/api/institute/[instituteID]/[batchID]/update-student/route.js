import { updateStudentInBatch } from "@/src/util/institute/batchControllers";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const { batchID } = await params;
    const { userID, tag, rollNo } = await request.json();

    if (!userID || !batchID) {
      return NextResponse.json(
        { success: false, message: "User ID and Batch ID are required" },
        { status: 400 }
      );
    }

    const result = await updateStudentInBatch({ userID, batchID, tag, rollNo });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Update Student API error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
