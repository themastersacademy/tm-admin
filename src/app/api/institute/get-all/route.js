import { getAllInstitutes } from "@/src/util/institute/instituteControllers";

export async function GET(req) {
  try {
    const result = await getAllInstitutes();
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
