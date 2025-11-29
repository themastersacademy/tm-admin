import { enrollStudentInBatch } from "@/src/util/institute/batchControllers";

export async function POST(req, { params }) {
  const { batchID } = await params;
  const { userID } = await req.json();
  if (!userID || !batchID) {
    return Response.json(
      { success: false, message: "User ID and batch ID are required" },
      { status: 400 }
    );
  }
  try {
    const result = await enrollStudentInBatch({ userID, batchID });
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
