import getGoal from "@/src/util/goals/getGoal";
import getSubject from "@/src/util/subjects/getSubject";
import addSubject from "@/src/util/goals/addSubject";

export async function POST(request) {
  const { goalID, subjectID } = await request.json();
  try {
    const goal = await getGoal({ goalID });
    if (!goal.success) {
      return Response.json(response, { status: 404 });
    }
    const subject = await getSubject({ subjectID });
    if (!subject.success) {
      return Response.json(response, { status: 404 });
    }
    const response = await addSubject({
      goalID: goal.data.goalID,
      subjectID: subject.data.subjectID,
      title: subject.data.title,
    });
    if (!response.success) {
      return Response.json(response, { status: 404 });
    }
    return Response.json(response, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
