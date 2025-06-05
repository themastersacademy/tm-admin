import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import {
  createThumbnail,
  uploadThumbnailToS3,
} from "@/src/lib/uploadThumbnail";
import defaultThumbnail from "@/public/Images/defaultThumbnail.svg";
import dropThumbnail from "@/public/Icons/dropThumbnail.svg";
import Image from "next/image";
import { apiFetch } from "@/src/lib/apiFetch";

export default function ThumbnailUpload({ course, setCourse }) {
  const { showSnackbar } = useSnackbar();
  const [thumbnail, setThumbnail] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressVariant, setProgressVariant] = useState("indeterminate");
  const [responseMessage, setResponseMessage] = useState("No file selected");
  const [thumbnailPreview, setThumbnailPreview] = useState(
    course.thumbnail || defaultThumbnail
  );
  const thumbnailInputRef = useRef(null);
  const MAX_THUMBNAIL_SIZE_MB = 4 * 1024 * 1024;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (course.thumbnail) {
      setThumbnailPreview(course.thumbnail || "");
    }
  }, [course.thumbnail]);

  const handleThumbnailChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      if (selectedFile.size > MAX_THUMBNAIL_SIZE_MB) {
        setResponseMessage("File size exceeds limit (Max: 5MB)");
        return;
      }
      setThumbnail(selectedFile);
      setThumbnailPreview(URL.createObjectURL(selectedFile));
    }
  };

  const triggerFileInput = () => {
    if (!thumbnailPreview || thumbnailPreview === defaultThumbnail) {
      thumbnailInputRef.current.click();
    }
  };

  const handleThumbnailUpload = async () => {
    if (!thumbnail) {
      showSnackbar("Select a thumbnail", "error", "", "3000");
      return;
    }

    setUploading(true);

    try {
      const fileData = await createThumbnail({
        file: thumbnail,
        courseID: course.id,
        goalID: course.goalID,
      });

      await uploadThumbnailToS3({
        file: thumbnail,
        fileData,
        setProgress,
        setResponseMessage,
        setUploading,
        setProgressVariant,
        setCourse,
        thumbnailPreview,
        setThumbnailPreview,
      });
      setThumbnailPreview(fileData.data.url);
    } catch (error) {
      setResponseMessage("Upload failed. Please try again.");
    }
    setUploading(false);
  };

  const handleDeleteThumbnail = () => {
    setIsLoading(true);
    try {
      apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/courses/delete-thumb`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseID: course.id,
            goalID: course.goalID,
          }),
        }
      ).then((data) => {
        if (data.success) {
          setCourse((prev) => ({ ...prev, thumbnail: null }));
          setThumbnailPreview(defaultThumbnail);
        } else {
          console.log("Not delete");
        }
        setIsLoading(false);
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Stack
        justifyContent="center"
        alignItems="center"
        sx={{
          border:
            thumbnailPreview === defaultThumbnail
              ? "1px dashed var(--text4)"
              : "none",
          width: "184px",
          height: "126px",
          borderRadius: "10px",
          cursor: "pointer",
          gap: "3px",
        }}
        onClick={triggerFileInput}
      >
        <Image
          src={thumbnailPreview}
          alt="Thumbnail Preview"
          width={184}
          height={126}
          style={{
            objectFit: "cover",
            display: thumbnailPreview !== defaultThumbnail ? "block" : "none",
            borderRadius: "10px",
            filter: uploading ? "blur(2px)" : "none",
          }}
        />
        {thumbnailPreview === defaultThumbnail && (
          <>
            <Image
              src={dropThumbnail.src}
              alt="drop"
              width={22}
              height={22}
              style={{ borderRadius: "10px" }}
            />
            <Typography
              sx={{
                fontSize: "12px",
                textAlign: "center",
                fontWeight: "400",
                color: "var(--text4)",
              }}
            >
              Click to upload
            </Typography>
            <Typography
              sx={{
                fontSize: "10px",
                textAlign: "center",
                width: "130px",
                color: "var(--text4)",
              }}
            >
              Resolution (1574 x 1080) 4MB max
            </Typography>
          </>
        )}
        {uploading && (
          <Stack
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress sx={{ color: "var(--primary-color)" }} />
          </Stack>
        )}
      </Stack>
      <input
        type="file"
        accept="image/*"
        ref={thumbnailInputRef}
        style={{ visibility: "hidden", position: "absolute" }}
        onChange={handleThumbnailChange}
      />

      {!course.thumbnail ? (
        <Button
          variant="contained"
          onClick={handleThumbnailUpload}
          sx={{
            backgroundColor: "var(--primary-color)",
            textTransform: "none",
            width: "120px",
          }}
          disabled={!thumbnail || uploading}
        >
          Upload
        </Button>
      ) : (
        <Button
          variant="contained"
          onClick={handleDeleteThumbnail}
          sx={{
            backgroundColor: "var(--delete-color)",
            textTransform: "none",
            width: "120px",
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} sx={{ color: "var(--white)" }} />
          ) : (
            "Delete"
          )}
        </Button>
      )}
    </>
  );
}
