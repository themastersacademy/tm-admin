import { getAllSubscriptionPlan } from "@/src/util/subscription/subscriptionController";

export async function GET(req) {
  try {
    const response = await getAllSubscriptionPlan();
    return Response.json(response);
  } catch (error) {
    return Response.json(
      {
        status: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
