import { createCourseEnrollment } from "@/src/util/user/userController";

export async function POST(request, { params }) {
  const { id } = await params;
  const { courseID, goalID, subscriptionPlanIndex } = await request.json();
  if (!courseID || !goalID) {
    return Response.json(
      {
        success: false,
        message: "Course ID and goal ID are required",
      },
      { status: 400 }
    );
  }
  try {
    const resp = await createCourseEnrollment(
      id,
      courseID,
      goalID,
      subscriptionPlanIndex
    );
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
