import { updateInstitute } from "@/src/util/institute/instituteControllers";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { instituteID, title } = await request.json();

    if (!instituteID || !title) {
      return NextResponse.json(
        { success: false, message: "Institute ID and title are required" },
        { status: 400 }
      );
    }

    const result = await updateInstitute({ instituteID, title });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Update Institute API error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
