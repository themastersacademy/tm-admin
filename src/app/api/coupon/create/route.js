import { createCoupon } from "@/src/util/coupon/couponController";

export async function POST(request) {
  const {
    title,
    code,
    couponClass,
    discountType,
    discountValue,
    maxDiscountPrice,
    minOrderAmount,
    totalRedemptions,
    totalRedemptionsPerUser,
    startDate,
    endDate,
    applicableCourses,
    applicableGoals,
  } = await request.json();
  if (
    !title ||
    !code ||
    !couponClass ||
    !discountType ||
    !discountValue ||
    !minOrderAmount ||
    !totalRedemptions ||
    !totalRedemptionsPerUser ||
    !startDate ||
    !endDate
  ) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  try {
    const coupon = await createCoupon({
      title,
      code,
      couponClass,
      discountType,
      discountValue,
      maxDiscountPrice,
      minOrderAmount,
      totalRedemptions,
      totalRedemptionsPerUser,
      startDate,
      endDate,
      applicableCourses,
      applicableGoals,
    });
    return Response.json(coupon);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
