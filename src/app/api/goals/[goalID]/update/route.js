import updateGoal from "@/src/util/goals/updateGoal";

export async function POST(request, { params }) {
  const { goalID } = await params;
  try {
    const { title, icon } = await request.json();
    if (!title || !icon) {
      return Response.json(
        { message: "Title and icon are required" },
        { status: 400 }
      );
    }
    const response = await updateGoal(goalID, { title, icon });
    return Response.json(response, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
