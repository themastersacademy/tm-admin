import { getAllBatchesByInstituteID } from "@/src/util/institute/batchControllers";

export async function GET(req, { params }) {
  const { instituteID } = await params;
  if (!instituteID) {
    return Response.json(
      { success: false, message: "Institute ID is required" },
      { status: 400 }
    );
  }
  try {
    const result = await getAllBatchesByInstituteID({ instituteID });
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
