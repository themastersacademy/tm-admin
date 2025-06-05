import { updateBasicCourseInfo } from "@/src/util/courses/updateCourse";
import checkUUID from "@/src/lib/checkUUID";

export async function POST(request) {
  const { courseID, goalID, title, description, language, duration } =
    await request.json();

  // Validate required fields.
  if (!courseID || !goalID || !title) {
    return Response.json(
      { message: "Course ID, goal ID, and title are required" },
      { status: 400 }
    );
  }

  // Title length must be between 3 and 50 characters.
  if (title.length < 3 || title.length > 50) {
    return Response.json(
      { message: "Title should be between 3 and 50 characters" },
      { status: 400 }
    );
  }

  // Validate that courseID and goalID are valid UUIDs.
  if (!checkUUID(courseID) || !checkUUID(goalID)) {
    return Response.json(
      { message: "Invalid course ID or goal ID" },
      { status: 400 }
    );
  }

  try {
    const result = await updateBasicCourseInfo({
      courseID,
      goalID,
      title,
      description,
      language,
      duration
    });
    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Error updating course:", error);
    return Response.json({ message: "Error updating course" }, { status: 500 });
  }
}
