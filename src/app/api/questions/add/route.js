import checkQuestionFormat from "@/src/lib/checkQuestionFormat";
import addQuestion from "@/src/util/questions/addQuestion";

export async function POST(request) {
  const questionData = await request.json();

  // Validate against our flat schema
  if (!checkQuestionFormat(questionData)) {
    return Response.json({ error: "Invalid question format" }, { status: 400 });
  }

  try {
    const result = await addQuestion(questionData);
    return Response.json(result, { status: 201 });
  } catch (err) {
    console.error("Error adding question:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
