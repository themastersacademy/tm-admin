import { getAllCoupons } from "@/src/util/coupon/couponController";

export async function GET(request) {
  try {
    const coupons = await getAllCoupons();
    return Response.json(coupons);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
