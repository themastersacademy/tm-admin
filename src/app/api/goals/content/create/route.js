import { createGoalContent } from "@/src/util/goals/goalContent";

export async function POST(request) {
  const { goalID, content } = await request.json();
  try {
    const result = await createGoalContent({ goalID, content });
    return Response.json(result, { status: 201 });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
