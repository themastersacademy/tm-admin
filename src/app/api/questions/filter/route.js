import { getQuestions } from "@/src/util/exam/questionFilterController";

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await getQuestions(body);

    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
