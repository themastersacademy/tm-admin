import { updateSubscriptionPlan } from "@/src/util/subscription/subscriptionController";

export async function POST(req) {
  const { id, priceWithTax, type, duration, planDiscountPercent } = await req.json();
  if (!id || !priceWithTax || !type || !duration || !planDiscountPercent) {
    return Response.json({
      status: false,
      message: "All fields are required",
    });
  }
  try {
    const response = await updateSubscriptionPlan(id, {
      priceWithTax,
      type,
      duration,
      planDiscountPercent,
    });
    return Response.json(response);
  } catch (error) {
    return Response.json({
      status: false,
      message: error.message,
    });
  }
}
