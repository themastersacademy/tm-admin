import { getAllUsers } from "@/src/util/user/userController";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const gender = searchParams.get("gender");
  const emailVerified = searchParams.get("emailVerified");
  const hasPage = searchParams.has("page");
  const hasLimit = searchParams.has("limit");
  const page = hasPage ? searchParams.get("page") : undefined;
  const limit = hasLimit ? searchParams.get("limit") : undefined;

  // Default to fast mode for search/autocomplete endpoints unless explicitly requested.
  const includeStatsParam = searchParams.get("includeStats");
  const includeStats =
    includeStatsParam !== null ? includeStatsParam === "true" : hasPage;

  try {
    const response = await getAllUsers({
      search,
      status,
      gender,
      emailVerified,
      page,
      limit,
      includeStats,
    });
    return Response.json(response);
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
