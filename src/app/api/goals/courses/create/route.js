import createCourse from "@/src/util/courses/createCourse";
import checkUUID from "@/src/lib/checkUUID";

export async function POST(request) {
  const { title, goalID, description, thumbnail, language } =
    await request.json();
  if (!title || !goalID) {
    return Response.json({ message: "Title is required" }, { status: 400 });
  }
  if (title.length < 3 || title.length > 150) {
    return Response.json(
      { message: title.length < 3 ? "Title must be at least 3 characters" : "Title must be 150 characters or less" },
      { status: 400 }
    );
  }
  //goalID should be a valid UUID
  if (!checkUUID(goalID)) {
    return Response.json({ message: "Invalid goal ID" }, { status: 400 });
  }
  try {
    const result = await createCourse({
      title,
      goalID,
      description,
      thumbnail,
      language,
    });
    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Error creating course:", error);
    return Response.json({ success: false, message: error.message || "Error creating course" }, { status: 500 });
  }
}
