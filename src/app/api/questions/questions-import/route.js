import checkQuestionFormat from "@/src/lib/checkQuestionFormat";
import { batchAddQuestions } from "@/src/util/questions/questionsBulkImport";

export async function POST(request) {
  const questions = await request.json();

  if (!Array.isArray(questions) || questions.length === 0) {
    return Response.json(
      { error: "Request body must be a non-empty array of questions" },
      { status: 400 }
    );
  }

  // Validate each question
  let invalid = [];
  for (const question of questions) {
    if(!checkQuestionFormat(question)){
      invalid.push(question);
    }
  }
  
  if (invalid.length > 0) {
    return Response.json({ success: false, invalid }, { status: 422 });
  }

  // All sanitized & valid → batch write
  try {
    const results = await batchAddQuestions(questions);

    // If any failure, return 207 Multi-Status semantics
    const anyFail = results.some((r) => !r.success);
    const status = anyFail ? 207 : 201;

    return Response.json({ success: true, results }, { status });
  } catch (error) {
    console.error("Error importing questions:", error);
    return Response.json(
      { success: false, error: "Failed to import questions" },
      { status: 500 }
    );
  }
}
