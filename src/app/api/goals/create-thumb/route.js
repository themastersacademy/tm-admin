import { createGoalThumbnail } from "@/src/util/goals/goalThumbnail";

export async function POST(request) {
  const { goalID, fileType, fileName } = await request.json();

  try {
    const result = await createGoalThumbnail({
      goalID,
      fileType,
      fileName,
    });
    return Response.json(result, { status: 201 });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
