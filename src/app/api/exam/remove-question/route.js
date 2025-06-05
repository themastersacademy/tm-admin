import { removeQuestionsFromSection } from "@/src/util/exam/examController";

export async function POST(req) {
  const { examID, type, sectionIndex, questionIDs } = await req.json();

  if (
    !examID ||
    !type ||
    sectionIndex === undefined ||
    !questionIDs
  ) {
    return Response.json(
      {
        success: false,
        message: "Missing required fields",
      },
      { status: 400 }
    );
  }

  try {
    const result = await removeQuestionsFromSection({
      examID,
      type,
      sectionIndex,
      questionIDs,
    });
    return Response.json(result);
  } catch (error) {
    console.log(error);
    
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
