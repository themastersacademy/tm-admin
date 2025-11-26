import { getExamsByBatchID } from "@/src/util/exam/batchExamController";

export async function GET(request, { params }) {
  try {
    const { batchID } = await params;
    const result = await getExamsByBatchID(batchID);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message || "Failed to fetch scheduled exams",
      },
      { status: 500 }
    );
  }
}
