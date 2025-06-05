import { deleteSubscriptionPlan } from "@/src/util/subscription/subscriptionController";

export async function POST(req) {
  const { id } = await req.json();
  if (!id) {
    return Response.json({
      status: false,
      message: "ID is required",
    });
  }
  try {
    const response = await deleteSubscriptionPlan(id);
    return Response.json(response);
  } catch (error) {
    return Response.json({
      status: false,
      message: error.message,
    });
  }
}
