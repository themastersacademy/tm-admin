import { getAllUsers } from "@/src/util/user/userController";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const gender = searchParams.get("gender");
  const emailVerified = searchParams.get("emailVerified");
  const page = searchParams.get("page") || 1;
  const limit = searchParams.get("limit") || 10;

  try {
    const response = await getAllUsers({
      search,
      status,
      gender,
      emailVerified,
      page,
      limit,
    });
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
