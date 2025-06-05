import { getGoalContent } from "@/src/util/goals/goalContent";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const goalID = searchParams.get("goalID");
  try {
    const response = await getGoalContent({ goalID });
    return Response.json(response, { status: 200 });
  } catch (error) {
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
