import { enrollStudentInBatch } from "@/src/util/institute/batchControllers";
import { getAllUsers } from "@/src/util/user/userController";

export async function POST(req, { params }) {
  const { batchID } = await params;
  const students = await req.json();

  if (!Array.isArray(students) || students.length === 0) {
    return Response.json(
      {
        success: false,
        message: "Invalid input. Expected an array of students.",
      },
      { status: 400 }
    );
  }

  const results = [];
  const errors = [];

  for (const student of students) {
    const { Email, RollNo, Department } = student; // Extract Department

    if (!Email) {
      errors.push({ ...student, error: "Email is required" });
      continue;
    }

    try {
      // Find user by email
      const userSearch = await getAllUsers({
        search: Email,
        limit: 10,
        includeStats: false,
      });

      let user = null;
      if (userSearch.success && userSearch.data.length > 0) {
        user = userSearch.data.find(
          (u) => u.email.toLowerCase() === Email.toLowerCase()
        );
      }

      if (!user) {
        errors.push({ ...student, error: "User not found" });
        continue;
      }

      // Enroll user with tag
      await enrollStudentInBatch({
        userID: user.id,
        batchID,
        rollNo: RollNo,
        tag: Department, // Pass tag
      });
      results.push({ ...student, status: "Enrolled" });
    } catch (error) {
      errors.push({ ...student, error: error.message });
    }
  }

  return Response.json({
    success: true,
    data: {
      enrolled: results,
      errors: errors,
    },
  });
}
