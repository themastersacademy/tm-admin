import { searchAllQuestions } from "@/src/util/exam/questionFilterController";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return Response.json(
      { success: false, error: "Search term is required" },
      { status: 400 }
    );
  }

  try {
    const questions = await searchAllQuestions(q);
    return Response.json({ success: true, data: questions }, { status: 200 });
  } catch (error) {
    console.error("Error searching questions:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
