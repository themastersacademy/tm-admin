import deleteLesson from "@/src/util/courses/deleteLesson";

export async function POST(request) {
  const { lessonID, courseID, goalID } = await request.json();
  if (!lessonID || !courseID || !goalID) {
    return Response.json(
      { success: false, message: "Missing lessonID, courseID, or goalID" },
      { status: 400 }
    );
  }
  try {
    const result = await deleteLesson({ lessonID, courseID, goalID });
    return Response.json(result);
  } catch (error) {
    console.error("Error in deleteLesson route:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
