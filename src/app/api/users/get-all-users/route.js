import { getAllUsers } from "@/src/util/user/userController";

export async function GET(request) {
//   const { searchParams } = new URL(request.url);
//   const lastEvaluatedKey = searchParams.get("lastEvaluatedKey");
  try {
    const response = await getAllUsers();
    return Response.json(response);
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
