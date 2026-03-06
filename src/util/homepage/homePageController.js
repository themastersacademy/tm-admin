import { dynamoDB } from "../awsAgent";
import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

// Get homepage settings (featured goals)
export async function getHomePageSettings() {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: {
      pKey: "HOMEPAGE",
      sKey: "SETTINGS",
    },
  };

  try {
    const response = await dynamoDB.send(new GetCommand(params));

    if (!response.Item) {
      // Return default settings if none exist
      return {
        success: true,
        data: {
          featuredGoalIDs: [],
        },
      };
    }

    return {
      success: true,
      data: {
        featuredGoalIDs: response.Item.featuredGoalIDs || [],
      },
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}

// Update featured goals
export async function updateFeaturedGoals(featuredGoalIDs) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Item: {
      pKey: "HOMEPAGE",
      sKey: "SETTINGS",
      featuredGoalIDs: featuredGoalIDs,
      updatedAt: Date.now(),
    },
  };

  try {
    await dynamoDB.send(new PutCommand(params));
    return {
      success: true,
      message: "Featured goals updated successfully",
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}

// Get all announcements
export async function getAllAnnouncements() {
  const TABLE = `${process.env.AWS_DB_NAME}master`;

  try {
    // Step 1: Query via GSI
    const gsiItems = [];
    let lastKey;

    do {
      const response = await dynamoDB.send(
        new QueryCommand({
          TableName: TABLE,
          IndexName: "masterTableIndex",
          KeyConditionExpression: "#gsi1pk = :gsi1pk",
          ExpressionAttributeNames: {
            "#gsi1pk": "GSI1-pKey",
          },
          ExpressionAttributeValues: {
            ":gsi1pk": "ANNOUNCEMENTS",
          },
          ...(lastKey && { ExclusiveStartKey: lastKey }),
        })
      );
      gsiItems.push(...(response.Items || []));
      lastKey = response.LastEvaluatedKey;
    } while (lastKey);

    // Step 2: Merge with legacy scan fallback
    const foundKeys = new Set(gsiItems.map((item) => item.pKey));
    let legacyLastKey;
    do {
      const response = await dynamoDB.send(
        new ScanCommand({
          TableName: TABLE,
          FilterExpression: "begins_with(pKey, :prefix)",
          ExpressionAttributeValues: {
            ":prefix": "ANNOUNCEMENT#",
          },
          ...(legacyLastKey && { ExclusiveStartKey: legacyLastKey }),
        })
      );
      for (const item of response.Items || []) {
        if (!foundKeys.has(item.pKey)) {
          gsiItems.push(item);
        }
      }
      legacyLastKey = response.LastEvaluatedKey;
    } while (legacyLastKey);

    const announcements = gsiItems.map((item) => ({
      announcementID: item.pKey.split("#")[1],
      title: item.title,
      message: item.message,
      type: item.type,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    // Sort by createdAt descending
    announcements.sort((a, b) => b.createdAt - a.createdAt);

    return {
      success: true,
      data: announcements,
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}

// Create announcement
export async function createAnnouncement({ title, message, type, isActive }) {
  const announcementID = randomUUID();
  const pKey = `ANNOUNCEMENT#${announcementID}`;
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Item: {
      pKey,
      sKey: "ANNOUNCEMENT",
      "GSI1-pKey": "ANNOUNCEMENTS",
      "GSI1-sKey": pKey,
      title,
      message,
      type: type || "info", // info, warning, success, error
      isActive: isActive !== undefined ? isActive : true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  };

  try {
    await dynamoDB.send(new PutCommand(params));
    return {
      success: true,
      message: "Announcement created successfully",
      data: { announcementID },
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}

// Update announcement
export async function updateAnnouncement(
  announcementID,
  { title, message, type, isActive }
) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: {
      pKey: `ANNOUNCEMENT#${announcementID}`,
      sKey: "ANNOUNCEMENT",
    },
    UpdateExpression:
      "set title = :t, message = :m, #type = :tp, isActive = :a, updatedAt = :u",
    ExpressionAttributeNames: {
      "#type": "type",
    },
    ExpressionAttributeValues: {
      ":t": title,
      ":m": message,
      ":tp": type,
      ":a": isActive,
      ":u": Date.now(),
    },
  };

  try {
    await dynamoDB.send(new UpdateCommand(params));
    return {
      success: true,
      message: "Announcement updated successfully",
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}

// Delete announcement
export async function deleteAnnouncement(announcementID) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: {
      pKey: `ANNOUNCEMENT#${announcementID}`,
      sKey: "ANNOUNCEMENT",
    },
  };

  try {
    await dynamoDB.send(new DeleteCommand(params));
    return {
      success: true,
      message: "Announcement deleted successfully",
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}

// Get active announcements (for user app)
export async function getActiveAnnouncements() {
  const TABLE = `${process.env.AWS_DB_NAME}master`;

  try {
    // Query via GSI + merge with legacy
    const gsiItems = [];
    let lastKey;

    do {
      const response = await dynamoDB.send(
        new QueryCommand({
          TableName: TABLE,
          IndexName: "masterTableIndex",
          KeyConditionExpression: "#gsi1pk = :gsi1pk",
          ExpressionAttributeNames: {
            "#gsi1pk": "GSI1-pKey",
          },
          ExpressionAttributeValues: {
            ":gsi1pk": "ANNOUNCEMENTS",
          },
          ...(lastKey && { ExclusiveStartKey: lastKey }),
        })
      );
      gsiItems.push(...(response.Items || []));
      lastKey = response.LastEvaluatedKey;
    } while (lastKey);

    const foundKeys = new Set(gsiItems.map((item) => item.pKey));
    let legacyLastKey;
    do {
      const response = await dynamoDB.send(
        new ScanCommand({
          TableName: TABLE,
          FilterExpression: "begins_with(pKey, :prefix)",
          ExpressionAttributeValues: {
            ":prefix": "ANNOUNCEMENT#",
          },
          ...(legacyLastKey && { ExclusiveStartKey: legacyLastKey }),
        })
      );
      for (const item of response.Items || []) {
        if (!foundKeys.has(item.pKey)) {
          gsiItems.push(item);
        }
      }
      legacyLastKey = response.LastEvaluatedKey;
    } while (legacyLastKey);

    // Filter active in-memory
    const activeItems = gsiItems.filter((item) => item.isActive === true);

    const announcements = activeItems.map((item) => ({
      announcementID: item.pKey.split("#")[1],
      title: item.title,
      message: item.message,
      type: item.type,
      createdAt: item.createdAt,
    }));

    // Sort by createdAt descending
    announcements.sort((a, b) => b.createdAt - a.createdAt);

    return {
      success: true,
      data: announcements,
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}
