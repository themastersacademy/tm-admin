import { deleteGoalThumbnail } from "@/src/util/goals/goalThumbnail";

export async function POST(request) {
  const { goalID } = await request.json();

  try {
    const result = await deleteGoalThumbnail({
      goalID,
    });
    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
