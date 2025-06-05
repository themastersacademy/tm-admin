import { getAllBatches } from "@/src/util/institute/batchControllers";

export async function GET(req, res) {
  try {
    const batches = await getAllBatches();
    return Response.json(batches);
  } catch (error) {
    return Response.json({
      success: false,
      message: error.message,
    });
  }
}
