import getGoal from "@/src/util/goals/getGoal";

export async function GET(request, { params }) {
  const { goalID } = await params;
  try {
    const response = await getGoal({ goalID });
    if (!response.success) {
      return Response.json(response, { status: 404 });
    }
    return Response.json(response, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
