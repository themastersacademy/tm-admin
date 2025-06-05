import { getExamGroupByGoalID } from "@/src/util/exam/groupExamController";

export async function POST(request) {
  const { goalID } = await request.json();
  if (!goalID) {
    return Response.json({
      success: false,
      message: "Goal ID is required",
    });
  }
  try {
    const result = await getExamGroupByGoalID(goalID);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
