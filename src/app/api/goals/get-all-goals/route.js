import getAllGoals from "@/src/util/goals/getAllGoals";

export async function GET(request) {
  try {
    const response = await getAllGoals();
    return Response.json(response, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
