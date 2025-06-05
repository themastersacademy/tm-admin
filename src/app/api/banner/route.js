import {
  getAllBanners,
  createBanner,
  verifyBannerUpload,
  deleteBanner,
} from "@/src/util/banners/bannersController";

export async function GET(req) {
  try {
    const { success, message, data } = await getAllBanners();
    return Response.json({ success, message, data }, { status: 200 });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const { fileName, fileType, title } = await req.json();
  if (!fileName || !fileType || !title) {
    return Response.json(
      { success: false, message: "Invalid request" },
      { status: 400 }
    );
  }
  try {
    const result = await createBanner({
      fileName,
      fileType,
      title,
    });
    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  const { bannerID } = await req.json();
  if (!bannerID) {
    return Response.json(
      { success: false, message: "Invalid request" },
      { status: 400 }
    );
  }
  try {
    const result = await verifyBannerUpload({ bannerID });
    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const { bannerID, path } = await req.json();
  if (!bannerID || !path) {
    return Response.json(
      { success: false, message: "Invalid request" },
      { status: 400 }
    );
  }
  try {
    const result = await deleteBanner({ bannerID, path });
    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
