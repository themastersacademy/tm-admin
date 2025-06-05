import { getCourseEnrollByUserID } from "@/src/util/user/userController";

export async function GET(request, { params }) {
  const { id } = await params;
  try {
    const response = await getCourseEnrollByUserID(id);
    console.log("response", response);
    return Response.json(response);
  } catch (error) {
    console.log("error", error);
    return Response.json({
      success: false,
      message: error.message,
    });
  }
}
