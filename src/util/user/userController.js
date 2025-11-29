import { dynamoDB } from "../awsAgent.js";
import {
  UpdateCommand,
  QueryCommand,
  PutCommand,
  DeleteCommand,
  ScanCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import getCourse from "../courses/getCourse.js";
import { getSubscriptionPlanByID } from "../subscription/subscriptionController.js";
import { randomUUID } from "crypto";

const USER_TABLE = `${process.env.AWS_DB_NAME}users`;
const USER_GSI_INDEX = "GSI1-index";

// This function is used to create a new user in the database

export async function getAllUsers({
  search,
  status,
  gender,
  emailVerified,
  page = 1,
  limit = 10,
} = {}) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}users`,
    IndexName: "GSI1-index",
    FilterExpression: "attribute_exists(email) AND begins_with(pKey, :pKey)",
    ProjectionExpression:
      "email, #name, phoneNumber, createdAt, image, emailVerified, id, accountType, #gender, #status",
    ExpressionAttributeNames: {
      "#name": "name",
      "#gender": "gender",
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":pKey": "USER#",
    },
    // Limit: 10,
  };

  if (search) {
    params.FilterExpression +=
      " AND (contains(email, :search) OR contains(#name, :search))";
    params.ExpressionAttributeValues[":search"] = search;
  }

  if (status) {
    params.FilterExpression += " AND #status = :status";
    params.ExpressionAttributeValues[":status"] = status;
  }

  if (gender) {
    params.FilterExpression += " AND #gender = :gender";
    params.ExpressionAttributeValues[":gender"] = gender;
  }

  if (emailVerified) {
    // Convert string "true"/"false" to boolean if needed, or keep as is if stored as string.
    // Assuming boolean in DB based on typical usage.
    const isVerified = emailVerified === "true";
    params.FilterExpression += " AND emailVerified = :emailVerified";
    params.ExpressionAttributeValues[":emailVerified"] = isVerified;
  }

  try {
    const response = await dynamoDB.send(new ScanCommand(params));
    const allItems = response.Items || [];
    const totalItems = allItems.length;
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Number(page);

    // Slice for pagination
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + Number(limit);
    const paginatedItems = allItems.slice(startIndex, endIndex);

    // Calculate global stats
    const totalVerified = allItems.filter((u) => u.emailVerified).length;
    const totalActive = allItems.filter((u) => u.status === "active").length;

    return {
      success: true,
      data: paginatedItems,
      pagination: {
        totalItems,
        totalPages,
        currentPage,
        limit: Number(limit),
        totalVerified,
        totalActive,
      },
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Internal server error");
  }
}

export async function getUserByID(id) {
  console.log(id);

  const params = {
    TableName: `${process.env.AWS_DB_NAME}users`,
    Key: {
      pKey: `USER#${id}`,
      sKey: `USER#${id}`,
    },
  };

  try {
    // const response = await dynamoDB.send(new GetCommand(params));
    const response = await dynamoDB.send(new GetCommand(params));
    if (response.Item) {
      return {
        success: true,
        data: {
          ...response.Item,
          id: response.Item.pKey.split("#")[1],
          otp: undefined,
          sKey: undefined,
          pKey: undefined,
          "GSI1-sKey": undefined,
          "GSI1-pKey": undefined,
          password: undefined,
        },
      };
    } else {
      return {
        success: false,
        message: "User not found",
      };
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Internal server error");
  }
}

export async function updateUser({
  id,
  name,
  phone,
  gender,
  address,
  studentMeta,
}) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}users`,
    Key: {
      pKey: `USER#${id}`,
      sKey: `USER#${id}`,
    },
    UpdateExpression:
      "set #name = :name, #phone = :phone, #gender = :gender, #address = :address, #studentMeta = :studentMeta, #updatedAt = :updatedAt",
    ExpressionAttributeNames: {
      "#name": "name",
      "#phone": "phone",
      "#gender": "gender",
      "#address": "address",
      "#studentMeta": "studentMeta",
      "#updatedAt": "updatedAt",
    },
    ExpressionAttributeValues: {
      ":name": name,
      ":phone": phone,
      ":gender": gender,
      ":address": address,
      ":studentMeta": studentMeta,
      ":updatedAt": Date.now(),
    },
    ConditionExpression: "attribute_exists(pKey)",
    ReturnValues: "ALL_NEW",
  };

  try {
    const response = await dynamoDB.send(new UpdateCommand(params));
    return {
      success: true,
      data: {
        ...response.Attributes,
        id: response.Attributes.pKey.split("#")[1],
        otp: undefined,
        sKey: undefined,
        pKey: undefined,
        "GSI1-sKey": undefined,
        "GSI1-pKey": undefined,
        password: undefined,
      },
    };
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Internal server error");
  }
}

export async function deleteUser(id) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}users`,
    Key: {
      pKey: `USER#${id}`,
      sKey: `USER#${id}`,
    },
  };

  try {
    await dynamoDB.send(new DeleteCommand(params));
    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Internal server error");
  }
}

export async function updateUserStatus(id, status) {
  // status can be active, deactivated, deleted
  if (status !== "active" && status !== "deactivated" && status !== "deleted") {
    throw new Error("Invalid status");
  }
  const params = {
    TableName: `${process.env.AWS_DB_NAME}users`,
    Key: {
      pKey: `USER#${id}`,
      sKey: `USER#${id}`,
    },
    UpdateExpression: "set #status = :status, #updatedAt = :updatedAt",
    ExpressionAttributeNames: {
      "#status": "status",
      "#updatedAt": "updatedAt",
    },
    ExpressionAttributeValues: {
      ":status": status,
      ":updatedAt": Date.now(),
    },
    ConditionExpression: "attribute_exists(pKey)",
    ReturnValues: "ALL_NEW",
  };
  try {
    const response = await dynamoDB.send(new UpdateCommand(params));
    return {
      success: true,
      data: {
        ...response.Attributes,
        id: response.Attributes.pKey.split("#")[1],
        otp: undefined,
        sKey: undefined,
        pKey: undefined,
        "GSI1-sKey": undefined,
        "GSI1-pKey": undefined,
        password: undefined,
      },
    };
  } catch (error) {
    console.error("Error updating user status:", error);
    throw new Error("Internal server error");
  }
}

export async function getExamAttemptsByUserID(id) {
  const params = {
    TableName: USER_TABLE,
    IndexName: USER_GSI_INDEX,
    KeyConditionExpression: "#gsi1pKey = :pKey AND #gsi1sKey = :sKey",
    ExpressionAttributeNames: {
      "#gsi1pKey": "GSI1-pKey",
      "#gsi1sKey": "GSI1-sKey",
      "#status": "status",
      "#duration": "duration",
      "#type": "type",
    },
    ExpressionAttributeValues: {
      ":pKey": "EXAM_ATTEMPTS",
      ":sKey": `EXAM_ATTEMPT@${id}`,
    },
    ProjectionExpression: `pKey, sKey, title, #status, obtainedMarks, 
                            totalMarks, totalAttemptedAnswers, totalCorrectAnswers, 
                            totalWrongAnswers, totalSkippedAnswers, totalSections, startTimeStamp, 
                            blobVersion, #duration, createdAt, settings, #type, totalQuestions`,
  };
  const response = await dynamoDB.send(new QueryCommand(params));
  return {
    success: true,
    data: response.Items,
  };
}

export async function getCourseEnrollByUserID(userID) {
  const params = {
    TableName: USER_TABLE,
    IndexName: USER_GSI_INDEX,
    KeyConditionExpression: "#gsi1pk = :pKey AND #gsi1sk = :sKey",
    ExpressionAttributeNames: {
      "#gsi1pk": "GSI1-pKey",
      "#gsi1sk": "GSI1-sKey",
    },
    ExpressionAttributeValues: {
      ":pKey": `COURSE_ENROLLMENT#${userID}`,
      ":sKey": "COURSE_ENROLLMENTS",
    },
  };

  try {
    const response = await dynamoDB.send(new QueryCommand(params));
    return {
      success: true,
      data: response.Items,
    };
  } catch (error) {
    console.error("Error fetching course enrollments:", error);
    throw new Error("Internal server error");
  }
}

export async function createCourseEnrollment(
  userID,
  courseID,
  goalID,
  subscriptionPlanIndex
) {
  const userResp = await getUserByID(userID);
  if (!userResp.success) {
    throw new Error("User not found");
  }
  const user = userResp.data;
  const courseResp = await getCourse({ courseID, goalID });
  if (!courseResp.success) {
    throw new Error("Course not found");
  }
  const now = Date.now();
  const course = courseResp.data;
  const subscription = course.subscription;
  const plan = subscription.plans[subscriptionPlanIndex];
  const expiresAt = calculateExpiresAt(plan.duration, plan.type, now);
  const courseEnrollmentID = randomUUID();

  const pKey = `COURSE_ENROLLMENT#${courseEnrollmentID}`;
  const sKey = `COURSE_ENROLLMENTS`;
  const gsi1pKey = `COURSE_ENROLLMENT#${userID}`;
  const gsi1sKey = "COURSE_ENROLLMENTS";

  const item = {
    pKey,
    sKey,
    "GSI1-pKey": gsi1pKey,
    "GSI1-sKey": gsi1sKey,
    courseID,
    goalID,
    userID,
    status: "active", //active, inactive, cancelled
    transactionID: null,
    priceBreakdown: null,
    plan,
    subscriptionMode: "ADMIN_SUBSCRIPTION",
    couponDetails: null,
    billingInfo: user.billingInfo[0],
    expiresAt,
    createdAt: now,
    updatedAt: now,
  };

  const params = {
    TableName: USER_TABLE,
    Item: item,
    ConditionExpression: "attribute_not_exists(pKey)",
  };

  const response = await dynamoDB.send(new PutCommand(params));
  return {
    success: true,
    message: "Course enrollment created successfully",
  };
}

export async function makeCourseEnrollmentActiveOrInactive(
  enrollmentID,
  status
) {
  // 1) Validate status
  const allowed = ["active", "inactive", "cancelled"];
  if (!allowed.includes(status)) {
    throw new Error(
      "Invalid status. Must be 'active', 'inactive', or 'cancelled'."
    );
  }

  const now = Date.now();
  const pKey = `COURSE_ENROLLMENT#${enrollmentID}`;
  const sKey = "COURSE_ENROLLMENTS";

  // 2) Build UpdateCommand to set status and updatedAt
  const params = {
    TableName: USER_TABLE,
    Key: { pKey, sKey },
    UpdateExpression: "SET #st = :st, #u = :u",
    ExpressionAttributeNames: {
      "#st": "status",
      "#u": "updatedAt",
    },
    ExpressionAttributeValues: {
      ":st": status,
      ":u": now,
    },
    ConditionExpression: "attribute_exists(pKey)", // ensure enrollment exists
  };

  try {
    await dynamoDB.send(new UpdateCommand(params));
    return {
      success: true,
      message: `Course enrollment ${status}.`,
    };
  } catch (err) {
    if (
      err.name === "ConditionalCheckFailedException" ||
      err.code === "ConditionalCheckFailed"
    ) {
      throw new Error(`Enrollment ${enrollmentID} does not exist.`);
    }
    console.error("Error updating course enrollment status:", err);
    throw new Error("Failed to update enrollment status");
  }
}

export async function getProSubscriptionByUserID(id) {
  const params = {
    TableName: USER_TABLE,
    IndexName: USER_GSI_INDEX,
    KeyConditionExpression: "#gsi1pk = :pKey AND #gsi1sk = :sKey",
    ExpressionAttributeNames: {
      "#gsi1pk": "GSI1-pKey",
      "#gsi1sk": "GSI1-sKey",
    },
    ExpressionAttributeValues: {
      ":pKey": `PRO_SUBSCRIPTION#${id}`,
      ":sKey": "PRO_SUBSCRIPTIONS",
    },
  };

  const result = await dynamoDB.send(new QueryCommand(params));
  const proSubscriptions = result.Items;

  if (proSubscriptions.length === 0) {
    return {
      success: false,
      message: "No active pro subscription found",
    };
  }

  return {
    success: true,
    data: proSubscriptions.map((item) => ({
      id: item.pKey.split("#")[1],
      ...item,
      pKey: undefined,
      sKey: undefined,
      "GSI1-sKey": undefined,
      "GSI1-pKey": undefined,
      // status: item.status,
      // expiresAt: item.expiresAt,
      // subscriptionSource: item.subscriptionSource,
    })),
  };
}

export async function createProSubscriptionAdmin({
  userID,
  subscriptionPlanID,
}) {
  const userResp = await getUserByID(userID);
  if (!userResp.success) {
    return userResp;
  }
  const subscriptionPlanResp = await getSubscriptionPlanByID(
    subscriptionPlanID
  );
  console.log("subscriptionPlanResp", subscriptionPlanResp);
  if (!subscriptionPlanResp.success) {
    return subscriptionPlanResp;
  }
  const subscriptionPlan = subscriptionPlanResp.data;

  const expiresAt = calculateExpiresAt(
    subscriptionPlan.duration,
    subscriptionPlan.type,
    Date.now()
  );

  const user = userResp.data;
  const proSubscriptionID = randomUUID();
  const pKey = `PRO_SUBSCRIPTION#${proSubscriptionID}`;
  const sKey = `PRO_SUBSCRIPTIONS`;
  const gsi1pKey = `PRO_SUBSCRIPTION#${userID}`; // GSI to query user→subscription
  const gsi1sKey = `PRO_SUBSCRIPTIONS`;
  const now = Date.now();

  const item = {
    pKey,
    sKey,
    "GSI1-pKey": gsi1pKey,
    "GSI1-sKey": gsi1sKey,
    status: "active", // immediately active for admin
    plan: subscriptionPlan, // entire plan object
    billingInfo: user.billingInfo[0], // the chosen billing address
    transactionID: null, // no transaction on admin side
    couponDetails: null, // could be null or object
    subscriptionSource: "ADMIN_SUBSCRIPTION", // mark source
    expiresAt: expiresAt, // null or a timestamp
    createdAt: now,
    updatedAt: now,
  };
  const params = {
    TableName: USER_TABLE,
    IndexName: USER_GSI_INDEX,
    Item: item,
    ConditionExpression: "attribute_not_exists(pKey)",
  };
  const response = await dynamoDB.send(new PutCommand(params));
  return {
    success: true,
    message: "Pro subscription created successfully",
  };
}

export async function getProSubscriptionByID(id) {
  const params = {
    TableName: USER_TABLE,
    Key: {
      pKey: `PRO_SUBSCRIPTION#${id}`,
      sKey: `PRO_SUBSCRIPTIONS`,
    },
  };
  const response = await dynamoDB.send(new GetCommand(params));
  return {
    success: true,
    data: response.Item,
  };
}

export async function makeProSubscriptionActiveOrInactive(id, status) {
  if (status !== "active" && status !== "inactive") {
    throw new Error("Invalid status");
  }
  const now = Date.now();
  const proSubscriptionResp = await getProSubscriptionByID(id);
  if (!proSubscriptionResp.success) {
    return proSubscriptionResp;
  }
  const proSubscription = proSubscriptionResp.data;
  const expiresAt = calculateExpiresAt(
    proSubscription.plan.duration,
    proSubscription.plan.type,
    proSubscription.createdAt
  );
  const params = {
    TableName: USER_TABLE,
    Key: {
      pKey: `PRO_SUBSCRIPTION#${id}`,
      sKey: `PRO_SUBSCRIPTIONS`,
    },
    UpdateExpression:
      "set #status = :status, #updatedAt = :updatedAt, #expiresAt = :expiresAt",
    ExpressionAttributeNames: {
      "#status": "status",
      "#updatedAt": "updatedAt",
      "#expiresAt": "expiresAt",
    },
    ExpressionAttributeValues: {
      ":status": status,
      ":updatedAt": now,
      ":expiresAt": expiresAt,
    },
    ConditionExpression: "attribute_exists(pKey)",
  };
  const response = await dynamoDB.send(new UpdateCommand(params));
  return {
    success: true,
    message: `Pro subscription ${status} successfully`,
  };
}

function calculateExpiresAt(duration, type, now) {
  const date = new Date(now);
  if (type === "MONTHLY") {
    const months = parseInt(duration);
    date.setMonth(date.getMonth() + months);
  }
  if (type === "YEARLY") {
    const years = parseInt(duration);
    date.setFullYear(date.getFullYear() + years);
  }
  return date.getTime();
}
