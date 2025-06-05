import { addQuestionToExamSection } from "@/src/util/exam/examController";

export async function POST(req) {
  const { examID, type, questions, sectionIndex } = await req.json();
  if (!examID || !type || !questions || sectionIndex === undefined) {
    return Response.json({
      success: false,
      message: "Missing required fields",
    });
  }

  try {
    const result = await addQuestionToExamSection({
      examID,
      type,
      questions,
      sectionIndex,
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({
      success: false,
      message: error.message,
    });
  }
}
