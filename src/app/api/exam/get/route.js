import { getExamByGoalID } from "@/src/util/exam/examController";

export async function POST(request) {
  const { goalID, type } = await request.json();
  try {
    const { success, message, data } = await getExamByGoalID({ goalID, type });
    if (!success) {
      return Response.json({ success, message }, { status: 500 });
    }
    return Response.json({ success, message, data }, { status: 200 });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
