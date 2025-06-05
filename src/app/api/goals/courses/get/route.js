import getCourse from "@/src/util/courses/getCourse";

export async function POST(request) {
  const { courseID, goalID } = await request.json();
  console.log(courseID);
  console.log(goalID);
  
  if (!courseID) {
    return Response.json({ message: "Course ID is required" }, { status: 400 });
  }
  try {
    const result = await getCourse({ courseID, goalID });
    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json({ message: "Error fetching course" }, { status: 500 });
  }
}
