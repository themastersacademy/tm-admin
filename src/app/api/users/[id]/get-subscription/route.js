import { getProSubscriptionByUserID } from "@/src/util/user/userController";

export async function GET(request, { params }) {
  const { id } = await params;
  try {
    const response = await getProSubscriptionByUserID(id);
    return Response.json(response);
  } catch (error) {
    return Response.json({
      success: false,
      message: error.message,
    });
  }
}
