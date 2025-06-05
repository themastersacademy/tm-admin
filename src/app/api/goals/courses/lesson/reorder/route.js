import { reorderLesson } from "@/src/util/courses/reorderLesson";

export async function POST(request) {
  const { courseID, goalID, lessonIDs } = await request.json();
  if (!courseID || !lessonIDs) {
    return Response.json(
      { success: false, message: "Missing courseID or lessonIDs" },
      { status: 400 }
    );
  }
  try {
    const result = await reorderLesson({ courseID, goalID, lessonIDs });
    return Response.json(result);
  } catch (error) {
    console.error("Error in reorderLesson route:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
