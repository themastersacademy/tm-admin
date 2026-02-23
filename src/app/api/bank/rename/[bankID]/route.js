import renameBank from "@/src/util/bank/renameBank";

export async function POST(request, { params }) {
  const { bankID } = await params;
  if (!bankID) {
    return Response.json(
      { success: false, message: "Bank ID is required" },
      { status: 400 },
    );
  }

  const { title } = await request.json();
  if (!title || !title.trim()) {
    return Response.json(
      { success: false, message: "Title is required" },
      { status: 400 },
    );
  }

  try {
    const result = await renameBank({ bankID, title: title.trim() });
    return Response.json(result, { status: result.success ? 200 : 404 });
  } catch (err) {
    console.log(err);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
