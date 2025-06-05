import { getFileURL } from "@/src/util/bank/getFileURL";

export async function GET(request) {
  const url = new URL(request.url);
  const path = url.searchParams.get("path");
  if (!path) {
    return Response.json({ error: "Invalid file path" }, { status: 400 });
  }

  try {
    const response = await getFileURL({ path, expiry: 60 * 5 });
    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error("Error getting file URL:", error);
    return Response.json({ error: "Error getting file URL" }, { status: 500 });
  }
}
