import { verifyUpload } from "@/src/util/bank/uploadVideo";

export async function POST(request) {
  const { videoID, bankID, resourceID } = await request.json();
  if (!videoID || !bankID || !resourceID) {
    return Response.json(
      {
        success: false,
        message: "videoID, bankID, and resourceID are required",
      },
      { status: 400 }
    );
  }
  try {
    const result = await verifyUpload({ videoID, bankID, resourceID });
    return Response.json(result, { status: 201 });
  } catch (err) {
    console.log(err);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
