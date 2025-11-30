import { createSubscriptionPlan } from "@/src/util/subscription/subscriptionController";

export async function POST(req) {
  const { priceWithTax, type, duration, discountInPercent } = await req.json();
  if (!priceWithTax || !type || !duration) {
    return Response.json({
      status: false,
      message: "All fields are required",
    });
  }
  try {
    const response = await createSubscriptionPlan({
      priceWithTax,
      type,
      duration,
      discountInPercent: discountInPercent || 0,
    });
    return Response.json(response);
  } catch (error) {
    return Response.json({
      status: false,
      message: error.message,
    });
  }
}
