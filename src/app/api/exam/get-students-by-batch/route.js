import { getStudentsByBatchIds } from "@/src/util/institute/batchControllers";

export async function POST(request) {
  try {
    const { batchIds } = await request.json();
    const response = await getStudentsByBatchIds(batchIds);
    return Response.json(response);
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
