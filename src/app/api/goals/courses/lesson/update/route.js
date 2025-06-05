import { updateLesson } from "@/src/util/courses/updateLesson";

export async function POST(request) {
  const { lessonID, courseID, isPreview, resourceID, title } =
    await request.json();
  if (!lessonID || !courseID) {
    return Response.json(
      { success: false, message: "Missing lessonID or courseID" },
      { status: 400 }
    );
  }
  try {
    const result = await updateLesson({
      lessonID,
      courseID,
      isPreview,
      resourceID,
      title,
    });
    return Response.json(result);
  } catch (error) {
    console.error("Error in updateLesson route:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
