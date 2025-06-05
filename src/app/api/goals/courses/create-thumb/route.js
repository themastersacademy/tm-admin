import { createThumbnail } from "@/src/util/courses/courseThumbnail";

export async function POST(request) {
  const { courseID, fileType, fileName, goalID } = await request.json();

  try {
    const result = await createThumbnail({
      courseID,
      fileType,
      fileName,
      goalID,
    });
    return Response.json(result, { status: 201 });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
