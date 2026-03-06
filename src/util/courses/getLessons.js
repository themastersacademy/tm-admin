import { dynamoDB } from "../awsAgent";
import { QueryCommand, ScanCommand, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

export default async function getLessons(courseID) {
  if (!courseID) {
    return { success: false, message: "Course ID is required" };
  }

  const TABLE = `${process.env.AWS_DB_NAME}master`;

  // 1. Query the course item using its partition key.
  const courseParams = {
    TableName: TABLE,
    KeyConditionExpression: "pKey = :pKey",
    ExpressionAttributeValues: {
      ":pKey": `COURSE#${courseID}`,
    },
  };

  let courseData;
  try {
    courseData = await dynamoDB.send(new QueryCommand(courseParams));
  } catch (error) {
    console.error("Error querying course:", error);
    throw new Error("Could not query course");
  }

  if (!courseData.Items || courseData.Items.length === 0) {
    return { success: false, message: "Course not found" };
  }

  // 2. Query lessons via GSI + merge with legacy scan
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
          ":gsi1pk": `LESSONS@${courseID}`,
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
        FilterExpression: "sKey = :sKey",
        ExpressionAttributeValues: {
          ":sKey": `LESSONS@${courseID}`,
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

  const lessonOrder = courseData.Items[0].lessonIDs || [];
  const lessonsById = {};
  gsiItems.forEach((item) => {
    const id = item.pKey.split("#")[1];
    lessonsById[id] = item;
  });

  // 3. Order the lessons according to the lessonIDs array.
  const orderedLessons = lessonOrder
    .map((id) => {
      const lesson = lessonsById[id];
      if (!lesson) return null;
      return {
        ...lesson,
        id,
        courseID,
        pKey: undefined,
        sKey: undefined,
      };
    })
    .filter((lesson) => lesson !== null);

  // 4. Sync the lessons count and lessonIDs if they have drifted from reality.
  const courseItem = courseData.Items[0];
  const storedCount = typeof courseItem.lessons === "number" ? courseItem.lessons : 0;
  const actualCount = orderedLessons.length;
  const hasOrphanedIDs = lessonOrder.length !== actualCount;

  if (storedCount !== actualCount || hasOrphanedIDs) {
    const cleanedLessonIDs = orderedLessons.map((l) => l.id);
    try {
      const goalID = courseItem.sKey?.split("@")[1];
      // Fix the course record's lessons count and clean orphaned lessonIDs
      await dynamoDB.send(
        new UpdateCommand({
          TableName: TABLE,
          Key: { pKey: `COURSE#${courseID}`, sKey: courseItem.sKey },
          UpdateExpression: "SET lessons = :count, lessonIDs = :lids",
          ExpressionAttributeValues: {
            ":count": actualCount,
            ":lids": cleanedLessonIDs,
          },
        })
      );
      // Fix the goal's coursesList lessons count
      if (goalID) {
        const goalResult = await dynamoDB.send(
          new GetCommand({
            TableName: TABLE,
            Key: { pKey: `GOAL#${goalID}`, sKey: "GOALS" },
            ProjectionExpression: "coursesList",
          })
        );
        if (goalResult.Item?.coursesList) {
          const coursesList = goalResult.Item.coursesList;
          const idx = coursesList.findIndex((c) => c.id === courseID);
          if (idx !== -1) {
            coursesList[idx].lessons = actualCount;
            await dynamoDB.send(
              new UpdateCommand({
                TableName: TABLE,
                Key: { pKey: `GOAL#${goalID}`, sKey: "GOALS" },
                UpdateExpression: "SET coursesList = :cl",
                ExpressionAttributeValues: { ":cl": coursesList },
              })
            );
          }
        }
      }
    } catch (syncError) {
      console.error("Error syncing lessons count:", syncError);
    }
  }

  // 5. Return lessons and sections (if any).
  const sections = courseItem.sections || [];

  return {
    success: true,
    message: "Lessons fetched successfully",
    data: orderedLessons,
    sections,
  };
}
