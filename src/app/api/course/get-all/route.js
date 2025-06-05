import { getALLCourse } from "@/src/util/courses/getAllCourses";

export async function GET(request) {
  try {
    const resp = await getALLCourse();
    return Response.json(resp);
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
