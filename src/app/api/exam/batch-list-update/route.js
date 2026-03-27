import { updateBatchListExamBasicInfo } from "@/src/util/exam/examController";

export async function POST(req) {
  const { batchList, examID } = await req.json();
  if (!batchList || !examID) {
    return Response.json({
      success: false,
      message: "Batch list and exam ID are required",
    }, { status: 400 });
  }
  if (
    typeof batchList !== "object" ||
    !Array.isArray(batchList) ||
    batchList.length === 0
  ) {
    return Response.json({
      success: false,
      message: "Batch list must be an array of strings",
    }, { status: 400 });
  }

  try {
    const res = await updateBatchListExamBasicInfo({ batchList, examID });
    return Response.json(res);
  } catch (error) {
    console.error("Error updating batch list:", error);
    return Response.json({
      success: false,
      message: error.message,
    }, { status: 500 });
  }
}
