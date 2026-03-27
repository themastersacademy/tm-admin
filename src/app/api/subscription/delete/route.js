import { deleteSubscriptionPlan } from "@/src/util/subscription/subscriptionController";

export async function POST(req) {
  const { id } = await req.json();
  if (!id) {
    return Response.json({
      success: false,
      message: "ID is required",
    }, { status: 400 });
  }
  try {
    const response = await deleteSubscriptionPlan(id);
    return Response.json(response);
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return Response.json({
      success: false,
      message: error.message,
    }, { status: 500 });
  }
}
