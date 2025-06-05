import { makeExamAsUnLive } from "@/src/util/exam/examController";

export async function POST(req) {
  const { examID, type } = await req.json();
  if (!examID || !type) {
    return Response.json(
      { error: "examID and type are required" },
      { status: 400 }
    );
  }
  try {
    const result = await makeExamAsUnLive({ examID, type });
    return Response.json(result);
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
