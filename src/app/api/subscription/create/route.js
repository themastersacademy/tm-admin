import { createSubscriptionPlan } from "@/src/util/subscription/subscriptionController";

export async function POST(req) {
  const { priceWithTax, type, duration, discountInPercent } = await req.json();
  if (!priceWithTax || !type || !duration) {
    return Response.json({
      success: false,
      message: "All fields are required",
    }, { status: 400 });
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
    console.error("Error creating subscription:", error);
    return Response.json({
      success: false,
      message: error.message,
    }, { status: 500 });
  }
}
