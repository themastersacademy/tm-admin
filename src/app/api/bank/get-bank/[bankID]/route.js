import getAllResources from "@/src/util/bank/getAllResources";

export async function GET(request, { params }) {
  const { bankID } = await params;
  if (!bankID) {
    return Response.json(
      { success: false, message: "bankID is required" },
      { status: 400 }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit"), 10)
      : undefined;
    const cursor = searchParams.get("cursor") || undefined;

    const result = await getAllResources({ bankID, limit, cursor });
    if (!result.success) {
      return Response.json(result, { status: 500 });
    }
    return Response.json(result, { status: 200 });
  } catch (err) {
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
