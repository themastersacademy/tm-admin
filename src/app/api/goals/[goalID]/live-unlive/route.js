import liveUnliveGoal from "@/src/util/goals/liveUnliveGoal";

export async function GET(request, { params }) {
  const { goalID } = await params;
  try {
    const response = await liveUnliveGoal({ goalID });
    return Response.json(response);
  } catch (error) {
    console.log(error);
    return Response.json({
      success: false,
      message: error.message,
    });
  }
}
