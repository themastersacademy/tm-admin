import { updateGoalContent } from "@/src/util/goals/goalContent";

export async function POST(request) {
  const { goalID, contentIndex, content } = await request.json();
  try {
    const result = await updateGoalContent({ goalID, contentIndex, content });
    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
