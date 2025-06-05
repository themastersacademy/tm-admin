import crypto from "crypto";

export default function generateBunnyVideoURL(videoID) {
  if (!videoID) throw new Error("videoID is required");
  const libraryID = process.env.BUNNY_VIDEO_LIBRARY_ID;
  const expiry = Math.floor(Date.now() / 1000) + 7200; // 2 hours from now (in seconds)

  const token = crypto
    .createHash("sha256")
    .update(process.env.BUNNY_STREAM_TOKEN + videoID + expiry)
    .digest("hex");

  return `https://iframe.mediadelivery.net/embed/${libraryID}/${videoID}?token=${token}&expires=${expiry}&autoplay=true&loop=false&muted=false&preload=true&responsive=true`;
}
