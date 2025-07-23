import { dynamoDB } from "../awsAgent";
import { randomUUID } from "crypto";

const TABLE_NAME = `${process.env.AWS_DB_NAME}master`;
const INDEX_NAME = "masterTableIndex";
const COUPON_SKEY = "COUPONS";

export async function createCoupon({
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
}) {
  const couponId = randomUUID();
  const now = Date.now();

  const coupon = {
    pKey: `COUPON#${couponId}`,
    sKey: COUPON_SKEY,
    "GSI1-pKey": `COUPON#${code}`,
    "GSI1-sKey": `COUPONs`,
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
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  validateCoupon(coupon, now);

  try {
    await dynamoDB
      .put({
        TableName: TABLE_NAME,
        IndexName: INDEX_NAME,
        Item: coupon,
        ConditionExpression: "attribute_not_exists(pKey)",
      })
      .promise();

    return {
      success: true,
      message: "Coupon created successfully",
      data: {
        ...coupon,
        id: couponId,
        pKey: undefined,
        sKey: undefined,
      },
    };
  } catch (error) {
    console.error("Error creating coupon:", error);
    throw new Error("Internal server error");
  }
}


export async function getAllCoupons() {
  const params = {
    TableName: TABLE_NAME,
    FilterExpression: "sKey = :sKey",
    ExpressionAttributeValues: {
      ":sKey": COUPON_SKEY,
    },
  };

  try {
    const response = await dynamoDB.scan(params).promise();
    return {
      success: true,
      data: response.Items.map((item) => ({
        ...item,
        id: item.pKey.split("#")[1],
        pKey: undefined,
        sKey: undefined,
      })),
    };
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw new Error("Internal server error");
  }
}

export async function updateCoupon({
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
}) {
  const now = Date.now();

  // Validate coupon details
  validateCoupon(
    {
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
    },
    now
  );

  const params = {
    TableName: TABLE_NAME,
    Key: {
      pKey: `COUPON#${id}`,
      sKey: COUPON_SKEY,
    },
    UpdateExpression: `set 
        #title = :title, 
        #code = :code, 
        #couponClass = :couponClass, 
        #discountType = :discountType, 
        #discountValue = :discountValue, 
        #maxDiscountPrice = :maxDiscountPrice, 
        #minOrderAmount = :minOrderAmount, 
        #totalRedemptions = :totalRedemptions, 
        #totalRedemptionsPerUser = :totalRedemptionsPerUser, 
        #startDate = :startDate, 
        #endDate = :endDate, 
        #isActive = :isActive, 
        #updatedAt = :updatedAt`,
    ExpressionAttributeNames: {
      "#title": "title",
      "#code": "code",
      "#couponClass": "couponClass",
      "#discountType": "discountType",
      "#discountValue": "discountValue",
      "#maxDiscountPrice": "maxDiscountPrice",
      "#minOrderAmount": "minOrderAmount",
      "#totalRedemptions": "totalRedemptions",
      "#totalRedemptionsPerUser": "totalRedemptionsPerUser",
      "#startDate": "startDate",
      "#endDate": "endDate",
      "#isActive": "isActive",
      "#updatedAt": "updatedAt",
    },
    ExpressionAttributeValues: {
      ":title": title,
      ":code": code,
      ":couponClass": couponClass,
      ":discountType": discountType,
      ":discountValue": discountValue,
      ":maxDiscountPrice": maxDiscountPrice,
      ":minOrderAmount": minOrderAmount,
      ":totalRedemptions": totalRedemptions,
      ":totalRedemptionsPerUser": totalRedemptionsPerUser,
      ":startDate": startDate,
      ":endDate": endDate,
      ":isActive": isActive,
      ":updatedAt": now,
    },
    ConditionExpression: "attribute_exists(pKey)",
    ReturnValues: "ALL_NEW",
  };

  try {
    const response = await dynamoDB.update(params).promise();
    return {
      success: true,
      message: "Coupon updated successfully",
    };
  } catch (error) {
    console.error("Error updating coupon:", error);
    throw new Error("Internal server error");
  }
}

export async function deleteCoupon(id) {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      pKey: `COUPON#${id}`,
      sKey: COUPON_SKEY,
    },
  };

  try {
    await dynamoDB.delete(params).promise();
    return {
      success: true,
      message: "Coupon deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting coupon:", error);
    throw new Error("Internal server error");
  }
}

function validateCoupon(coupon, now) {
  if (!coupon.title) throw new Error("Title is required");
  if (!coupon.code) throw new Error("Code is required");
  if (!coupon.couponClass) throw new Error("Coupon class is required");
  if (!["ALL", "GOALS", "COURSES"].includes(coupon.couponClass))
    throw new Error("Invalid coupon class");
  if (!coupon.discountType) throw new Error("Discount type is required");
  if (coupon.discountValue === undefined || coupon.discountValue < 0)
    throw new Error("Discount value must be 0 or greater");
  if (coupon.discountType !== "PERCENTAGE" && coupon.discountType !== "FIXED")
    throw new Error("Invalid discount type");
  if (coupon.discountType === "PERCENTAGE" && coupon.discountValue > 100)
    throw new Error("Percentage discount cannot exceed 100%");
  if (coupon.discountType === "FIXED" && coupon.discountValue > 1000000)
    throw new Error("Fixed discount cannot exceed 1,000,000");
  if (coupon.maxDiscountPrice !== undefined && coupon.maxDiscountPrice < 0)
    throw new Error("Max discount price cannot be negative");
  if (coupon.minOrderAmount !== undefined && coupon.minOrderAmount < 0)
    throw new Error("Min order amount cannot be negative");
  if (coupon.totalRedemptions !== undefined && coupon.totalRedemptions < 0)
    throw new Error("Total redemptions cannot be negative");
  if (
    coupon.totalRedemptionsPerUser !== undefined &&
    coupon.totalRedemptionsPerUser < 0
  )
    throw new Error("Total redemptions per user cannot be negative");
  //   if (coupon.startDate !== undefined && coupon.startDate < now)
  //     throw new Error("Start date cannot be in the past");
  if (coupon.endDate !== undefined && coupon.endDate < now)
    throw new Error("End date cannot be in the past");
  if (
    coupon.startDate !== undefined &&
    coupon.endDate !== undefined &&
    coupon.startDate > coupon.endDate
  )
    throw new Error("Start date cannot be after end date");
}
