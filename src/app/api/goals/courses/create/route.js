import createCourse from "@/src/util/courses/createCourse";
import checkUUID from "@/src/lib/checkUUID";

export async function POST(request) {
  const { title, goalID } = await request.json();
  if (!title || !goalID) {
    return Response.json({ message: "Title is required" }, { status: 400 });
  }
  //title should be more than 3 characters and less than 50 characters
  if (title.length < 3 || title.length > 50) {
    return Response.json(
      { message: "Title should be more than 3 characters" },
      { status: 400 }
    );
  }
  //goalID should be a valid UUID
  if (!checkUUID(goalID)) {
    return Response.json({ message: "Invalid goal ID" }, { status: 400 });
  }
  try {
    const result = await createCourse({ title, goalID });
    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json({ message: "Error creating course" }, { status: 500 });
  }
}
