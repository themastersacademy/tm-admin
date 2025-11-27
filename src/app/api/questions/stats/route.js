import { getQuestionStats } from "@/src/util/exam/questionFilterController";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getQuestionStats();
    return Response.json({ success: true, data: stats }, { status: 200 });
  } catch (error) {
    console.error("Error fetching question stats:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
