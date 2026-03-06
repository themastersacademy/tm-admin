import { dynamoDB } from "../awsAgent";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

export async function updateSections({ courseID, goalID, action, payload }) {
  if (!courseID || !goalID || !action) {
    return { success: false, message: "Missing required fields" };
  }

  const TABLE = `${process.env.AWS_DB_NAME}master`;
  const Key = { pKey: `COURSE#${courseID}`, sKey: `COURSES@${goalID}` };

  try {
    const courseResult = await dynamoDB.send(new GetCommand({ TableName: TABLE, Key }));
    if (!courseResult.Item) {
      return { success: false, message: "Course not found" };
    }

    const course = courseResult.Item;
    let sections = course.sections || [];
    const lessonIDs = course.lessonIDs || [];

    switch (action) {
      case "CREATE_SECTION": {
        const { title } = payload;
        const sectionID = randomUUID();
        sections.push({ id: sectionID, title: title || "Untitled Section", lessonIDs: [] });
        break;
      }

      case "RENAME_SECTION": {
        const { sectionID, title } = payload;
        const section = sections.find((s) => s.id === sectionID);
        if (!section) return { success: false, message: "Section not found" };
        section.title = title;
        break;
      }

      case "DELETE_SECTION": {
        const { sectionID } = payload;
        const sectionIndex = sections.findIndex((s) => s.id === sectionID);
        if (sectionIndex === -1) return { success: false, message: "Section not found" };
        const removedSection = sections[sectionIndex];
        sections.splice(sectionIndex, 1);
        // Move orphaned lessons to next section, or previous, or leave unsectioned
        if (removedSection.lessonIDs.length > 0) {
          if (sections.length > 0) {
            const targetIndex = Math.min(sectionIndex, sections.length - 1);
            sections[targetIndex].lessonIDs.push(...removedSection.lessonIDs);
          }
          // If no sections left, lessons stay in flat lessonIDs (backward compat)
        }
        break;
      }

      case "REORDER_SECTIONS": {
        const { sectionIDs } = payload;
        const sectionMap = {};
        sections.forEach((s) => { sectionMap[s.id] = s; });
        const reordered = sectionIDs
          .map((id) => sectionMap[id])
          .filter(Boolean);
        sections = reordered;
        break;
      }

      case "MOVE_LESSON": {
        const { lessonID, fromSectionID, toSectionID, toIndex } = payload;
        // Remove from source section
        if (fromSectionID) {
          const fromSection = sections.find((s) => s.id === fromSectionID);
          if (fromSection) {
            fromSection.lessonIDs = fromSection.lessonIDs.filter((id) => id !== lessonID);
          }
        }
        // Add to target section
        if (toSectionID) {
          const toSection = sections.find((s) => s.id === toSectionID);
          if (toSection) {
            const idx = typeof toIndex === "number" ? toIndex : toSection.lessonIDs.length;
            toSection.lessonIDs.splice(idx, 0, lessonID);
          }
        }
        break;
      }

      case "REORDER_WITHIN_SECTION": {
        const { sectionID, lessonIDs: newOrder } = payload;
        const section = sections.find((s) => s.id === sectionID);
        if (!section) return { success: false, message: "Section not found" };
        section.lessonIDs = newOrder;
        break;
      }

      case "INIT_SECTIONS": {
        // Migrate flat list into a single default section
        if (sections.length === 0 && lessonIDs.length > 0) {
          sections = [{
            id: randomUUID(),
            title: "General",
            lessonIDs: [...lessonIDs],
          }];
        }
        break;
      }

      default:
        return { success: false, message: "Invalid action" };
    }

    // Rebuild the flat lessonIDs from sections order
    const flatLessonIDs = sections.flatMap((s) => s.lessonIDs);
    // Include any lessons not in any section (edge case for backward compat)
    const sectionedSet = new Set(flatLessonIDs);
    const unsectioned = lessonIDs.filter((id) => !sectionedSet.has(id));
    const finalLessonIDs = [...flatLessonIDs, ...unsectioned];

    await dynamoDB.send(
      new UpdateCommand({
        TableName: TABLE,
        Key,
        UpdateExpression: "SET sections = :sections, lessonIDs = :lids, updatedAt = :u",
        ExpressionAttributeValues: {
          ":sections": sections,
          ":lids": finalLessonIDs,
          ":u": Date.now(),
        },
      })
    );

    return { success: true, message: "Sections updated", sections };
  } catch (error) {
    console.error("Error updating sections:", error);
    throw new Error("Internal server error");
  }
}
