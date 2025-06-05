import createLesson from "@/src/util/courses/createLesson";

export async function POST(request) {
  const { courseID } = await request.json();
  if (!courseID) {
    return Response.json(
      { success: false, message: "Missing courseID" },
      { status: 400 }
    );
  }
  try {
    const result = await createLesson({ courseID });
    return Response.json(result);
  } catch (error) {
    console.error("Error in createLesson route:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
