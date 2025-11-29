import {
  getHomePageSettings,
  updateFeaturedGoals,
} from "@/src/util/homepage/homePageController";

export async function GET(request) {
  try {
    const result = await getHomePageSettings();
    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { featuredGoalIDs } = await request.json();

    if (!Array.isArray(featuredGoalIDs)) {
      return Response.json(
        { success: false, message: "featuredGoalIDs must be an array" },
        { status: 400 }
      );
    }

    const result = await updateFeaturedGoals(featuredGoalIDs);
    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
