import uploadImage from "@/src/util/questions/uploadImage";

export async function POST(request) {
  const { filename, fileType } = await request.json();
  if (!filename || !fileType) {
    return Response.json(
      { error: "Invalid filename or file type" },
      { status: 400 }
    );
  }
  try {
    const response = await uploadImage({ filename, fileType });
    return Response.json(response, { status: 201 });
  } catch (error) {
    console.error("Error uploading image:", error);
    return Response.json({ error: "Error uploading image" }, { status: 500 });
  }
}
