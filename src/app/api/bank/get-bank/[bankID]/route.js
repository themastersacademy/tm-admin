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
    const result = await getAllResources({ bankID });
    if (!result.success) {
      return Response.json(result, { status: 500 });
    }
    return Response.json(result, { status: 200 });
  } catch (err) {
    console.log(err);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
