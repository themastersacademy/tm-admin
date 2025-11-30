import { getUsersByIds } from "@/src/util/user/userController";

export async function POST(request) {
  try {
    const { ids } = await request.json();
    const response = await getUsersByIds(ids);
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
