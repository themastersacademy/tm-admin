import { deleteThumbnail } from "@/src/util/courses/courseThumbnail";

export async function POST(request) {
  const { courseID, goalID } = await request.json();
  try {
    const result = await deleteThumbnail({
      courseID,
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
