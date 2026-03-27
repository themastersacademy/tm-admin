import checkQuestionFormat from "@/src/lib/checkQuestionFormat";
import updateQuestion from "@/src/util/questions/updateQuestion";

export async function POST(request) {
  const questionData = await request.json();

  // Validate against our flat schema
  // Note: checkQuestionFormat might need questionID if it checks for it, but usually it checks content.
  // We should ensure questionID is present.
  if (!questionData.questionID) {
    return Response.json({ error: "Missing questionID" }, { status: 400 });
  }

  if (!checkQuestionFormat(questionData)) {
    return Response.json({ error: "Invalid question format" }, { status: 400 });
  }

  try {
    const result = await updateQuestion(questionData);
    return Response.json(result, { status: 200 });
  } catch (err) {
    console.error("Error updating question:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
