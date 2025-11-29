import { getQuestions } from "@/src/util/exam/questionFilterController";

/**
 * GET /api/questions
 * Query parameters:
 *   subjectID (required), type, difficulty, search, isRandom, count, limit, lastKey
 */
export async function GET(request) {
  const url = new URL(request.url);
  const subjectID = url.searchParams.get("subjectID");
  const type = url.searchParams.get("type") || undefined;
  const difficultyLevelParam = url.searchParams.get("difficulty");
  const difficultyLevel = difficultyLevelParam
    ? parseInt(difficultyLevelParam, 10)
    : undefined;
  const searchTerm = url.searchParams.get("search") || undefined;
  const isRandom = url.searchParams.get("isRandom") === "true";
  const countParam = url.searchParams.get("count");
  const count = countParam ? parseInt(countParam, 10) : undefined;
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;

  // Parse lastEvaluatedKey if provided as encoded JSON
  let lastEvaluatedKey = undefined;
  const lastKeyParam = url.searchParams.get("lastKey");
  if (lastKeyParam) {
    try {
      lastEvaluatedKey = JSON.parse(decodeURIComponent(lastKeyParam));
    } catch {
      lastEvaluatedKey = undefined;
    }
  }

  try {
    const { questions, lastEvaluatedKey: newLastKey } = await getQuestions({
      subjectID,
      type,
      difficultyLevel,
      searchTerm,
      isRandom,
      count,
      limit,
      lastEvaluatedKey,
    });

    // Encode the new last key for the next page
    const encodedLastKey = newLastKey
      ? encodeURIComponent(JSON.stringify(newLastKey))
      : null;

    return Response.json(
      { success: true, data: questions, lastKey: encodedLastKey },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching questions:", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
