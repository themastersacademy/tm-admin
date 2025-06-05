import { getStudentsForBatch } from "@/src/util/institute/batchControllers";

export async function GET(req, { params }) {
  const { batchID } = await params;
  if (!batchID) {
    return Response.json(
      { success: false, message: "Batch ID is required" },
      { status: 400 }
    );
  }
  const result = await getStudentsForBatch(batchID);
  return Response.json(result);
}
