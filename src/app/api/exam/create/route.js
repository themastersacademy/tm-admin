import { createExam } from "@/src/util/exam/examController";

export async function POST(request) {
  const { type, title, groupID, goalID, batchList } = await request.json();
  try {
    const exam = await createExam({ type, title, groupID, goalID, batchList });
    return Response.json(exam);
  } catch (error) {
    console.log(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
