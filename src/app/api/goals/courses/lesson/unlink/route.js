import { unlinkResource } from "@/src/util/courses/updateLesson";

export async function POST(request) {
  const { lessonID, courseID, resourceID } = await request.json();
  if (!lessonID || !courseID || !resourceID) {
    return Response.json(
      { success: false, message: "Missing lessonID, courseID, or resourceID" },
      { status: 400 }
    );
  }
  try {
    const result = await unlinkResource({ lessonID, courseID, resourceID });
    return Response.json(result);
  } catch (error) {
    console.error("Error in unlinkLessonResource route:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
