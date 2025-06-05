import { getAllScheduledExams } from "@/src/util/exam/scheduleExamController";

export async function GET(request) {
  try {
    const response = await getAllScheduledExams();
    return Response.json(response);
  } catch (error) {
    return Response.json({
      success: false,
      message: "Error fetching scheduled exams",
      error: error.message,
    });
  }
}
