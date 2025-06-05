import { getAllExamAttemptsByExamID } from "@/src/util/exam/examAttemptController";

export async function GET(request, { params }) {
  const { examID } = await params;
  try {
    const response = await getAllExamAttemptsByExamID(examID);
    return Response.json(response);
  } catch (error) {
    console.log(error);
    return Response.json({
      success: false,
      message: error.message,
    });
  }
}
