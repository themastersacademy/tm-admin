import getAllSubjects from "@/src/util/subjects/getAllSubjects";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit"), 10)
      : undefined;
    const cursor = searchParams.get("cursor") || undefined;

    const response = await getAllSubjects({ limit, cursor });
    return Response.json(response, { status: 200 });
  } catch (error) {
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
