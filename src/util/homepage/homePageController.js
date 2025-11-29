import { dynamoDB } from "../awsAgent";
import {
  GetCommand,
  PutCommand,
  UpdateCommand,
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
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    FilterExpression: "begins_with(pKey, :prefix)",
    ExpressionAttributeValues: {
      ":prefix": "ANNOUNCEMENT#",
    },
  };

  try {
    const response = await dynamoDB.send(new ScanCommand(params));

    const announcements = (response.Items || []).map((item) => ({
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
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Item: {
      pKey: `ANNOUNCEMENT#${announcementID}`,
      sKey: "ANNOUNCEMENT",
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
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    FilterExpression: "begins_with(pKey, :prefix) AND isActive = :active",
    ExpressionAttributeValues: {
      ":prefix": "ANNOUNCEMENT#",
      ":active": true,
    },
  };

  try {
    const response = await dynamoDB.send(new ScanCommand(params));

    const announcements = (response.Items || []).map((item) => ({
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
