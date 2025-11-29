import checkQuestionFormat from "@/src/lib/checkQuestionFormat";
import updateQuestion from "@/src/util/questions/updateQuestion";

export async function POST(request) {
  const questionData = await request.json();

  // Validate against our flat schema
  // Note: checkQuestionFormat might need questionID if it checks for it, but usually it checks content.
  // We should ensure questionID is present.
  if (!questionData.questionID) {
    return new Response(JSON.stringify({ error: "Missing questionID" }), {
      status: 400,
    });
  }

  if (!checkQuestionFormat(questionData)) {
    return new Response(JSON.stringify({ error: "Invalid question format" }), {
      status: 400,
    });
  }

  try {
    const result = await updateQuestion(questionData);
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.error("Error updating question:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
