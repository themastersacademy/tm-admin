import { updateCoupon } from "@/src/util/coupon/couponController";

export async function POST(request) {
  const {
    id,
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
    isActive,
  } = await request.json();

  // Use strict undefined checks to allow valid falsy values (like false)
  if (
    id === undefined ||
    title === undefined ||
    code === undefined ||
    couponClass === undefined ||
    discountType === undefined ||
    discountValue === undefined ||
    maxDiscountPrice === undefined ||
    minOrderAmount === undefined ||
    totalRedemptions === undefined ||
    totalRedemptionsPerUser === undefined ||
    startDate === undefined ||
    endDate === undefined ||
    isActive === undefined
  ) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const coupon = await updateCoupon({
      id,
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
      isActive,
    });
    return Response.json(coupon);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
