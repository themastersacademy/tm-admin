import { makeProSubscriptionActiveOrInactive } from "@/src/util/user/userController";

export async function POST(request, { params }) {
  const { isActive, subscriptionID } = await request.json();

  const status = isActive ? "active" : "inactive";

  try {
    const response = await makeProSubscriptionActiveOrInactive(subscriptionID, status);
    return Response.json(response);
  } catch (error) {
    return Response.json({
      success: false,
      message: error.message,
    });
  }
}
