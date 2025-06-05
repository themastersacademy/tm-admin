import createGoals from "@/src/util/goals/createGoals";

export async function POST(request) {
  try {
    const { title, icon } = await request.json();
    if (!title || !icon) {
      return Response.json(
        { message: "Title and icon are required" },
        { status: 400 }
      );
    }
    const response = await createGoals({ title, icon });
    return Response.json(response, { status: 201 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
