import { deleteGoalContent } from "@/src/util/goals/goalContent";

export async function POST(request) {
  const { goalID, contentIndex } = await request.json();
  try {
    const result = await deleteGoalContent({ goalID, contentIndex });
    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
