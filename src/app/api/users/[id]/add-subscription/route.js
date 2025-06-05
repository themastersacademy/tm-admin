import { createProSubscriptionAdmin } from "@/src/util/user/userController";

export async function POST(request, { params }) {
  const { id } = await params;
  const { subscriptionPlanID } = await request.json();

  if (!id || !subscriptionPlanID) {
    return Response.json({
      success: false,
      message: "User ID and subscription plan ID are required",
    });
  }
  try {
    const response = await createProSubscriptionAdmin({
      userID: id,
      subscriptionPlanID,
    });
    return Response.json(response);
  } catch (error) {
    return Response.json({
      success: false,
      message: error.message,
    });
  }
}
