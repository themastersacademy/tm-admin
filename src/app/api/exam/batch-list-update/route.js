import { updateBatchListExamBasicInfo } from "@/src/util/exam/examController";

export async function POST(req) {
  const { batchList, examID } = await req.json();
  console.log("batchList", batchList);
  console.log("examID", examID);
  if (!batchList || !examID) {
    return Response.json({
      success: false,
      message: "Batch list and exam ID are required",
    });
  }
  if (
    typeof batchList !== "object" ||
    !Array.isArray(batchList) ||
    batchList.length === 0
  ) {
    return Response.json({
      success: false,
      message: "Batch list must be an array of strings",
    });
  }

  try {
    const res = await updateBatchListExamBasicInfo({ batchList, examID });
    return Response.json(res);
  } catch (error) {
    return Response.json({
      success: false,
      message: error.message,
    });
  }
}
