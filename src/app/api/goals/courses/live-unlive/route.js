import liveUnliveCourse from "@/src/util/courses/liveUnliveCourse";

export async function POST(request) {
  const { courseID, goalID } = await request.json();
  if (!courseID || !goalID) {
    return Response.json(
      { message: "Course ID and goal ID are required" },
      { status: 400 }
    );
  }
  try {
    const response = await liveUnliveCourse({ courseID, goalID });
    return Response.json(response, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: "Error live/unlive course" },
      { status: 500 }
    );
  }
}
