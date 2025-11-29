"use client";
import {
  Button,
  DialogContent,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
  Dialog,
  Divider,
} from "@mui/material";
import StyledTextField from "../StyledTextField/StyledTextField";
import { useState, useRef } from "react";
import {
  Close,
  CloudUpload,
  Image as ImageIcon,
  CheckCircle,
} from "@mui/icons-material";
import { createBanner, uploadToS3 } from "@/src/lib/uploadBanner";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

export default function BannerUpload({
  isOpen,
  onClose,
  fetchBanners,
  showSnackbar,
}) {
  const MAX_FILE_SIZE =
    Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_BANNER_SIZE_MB) * 1024 * 1024;
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [isFileSizeExceed, setIsFileSizeExceed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("No file selected");
  const [progressVariant, setProgressVariant] = useState("indeterminate");
  const [crop, setCrop] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const imgRef = useRef(null);

  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    else return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Clear previous preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    const fileSizeDisplay = formatFileSize(selectedFile.size);

    // Check file type
    if (!["image/jpeg", "image/png"].includes(selectedFile.type)) {
      setIsFileSizeExceed(true);
      setFile(null);
      setResponseMessage("Only JPEG or PNG images are allowed.");
      return;
    }

    // Check file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setIsFileSizeExceed(true);
      setFile(null);
      setResponseMessage(
        `File size ${fileSizeDisplay}. Max limit is ${formatFileSize(
          MAX_FILE_SIZE
        )}`
      );
      return;
    }

    // Load image for cropping
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setShowCropDialog(true);
    };
    reader.readAsDataURL(selectedFile);
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "px",
          width: 1200,
          height: 600,
        },
        1200 / 600,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  };

  const getCroppedImg = async () => {
    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas to the exact crop size in natural pixels
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    const ctx = canvas.getContext("2d");

    // Draw the cropped image at the correct scale
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    // Resize to 1200x600 with high quality
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = 1200;
    finalCanvas.height = 600;
    const finalCtx = finalCanvas.getContext("2d");
    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = "high";
    finalCtx.drawImage(canvas, 0, 0, 1200, 600);

    return new Promise((resolve) => {
      finalCanvas.toBlob((blob) => {
        const croppedFile = new File(
          [blob],
          file?.name || "cropped-image.jpg",
          {
            type: "image/jpeg",
          }
        );
        resolve(croppedFile);
      }, "image/jpeg");
    });
  };

  const handleCropConfirm = async () => {
    if (!crop) return;
    const croppedFile = await getCroppedImg();
    const fileSizeDisplay = formatFileSize(croppedFile.size);

    if (croppedFile.size > MAX_FILE_SIZE) {
      setIsFileSizeExceed(true);
      setResponseMessage(
        `Cropped file size ${fileSizeDisplay}. Max limit is ${formatFileSize(
          MAX_FILE_SIZE
        )}`
      );
      setShowCropDialog(false);
      return;
    }

    // Create preview URL
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const newPreviewUrl = URL.createObjectURL(croppedFile);
    setPreviewUrl(newPreviewUrl);

    setFile(croppedFile);
    setIsFileSizeExceed(false);
    setResponseMessage(`File size ${fileSizeDisplay}. Ready to upload.`);
    setShowCropDialog(false);
    setImageSrc(null);
    setCrop(null);
  };

  const handleCropCancel = () => {
    setShowCropDialog(false);
    setImageSrc(null);
    setCrop(null);
    setResponseMessage("No file selected");
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async () => {
    if (!file || !title) {
      setResponseMessage("Please provide a title and select an image.");
      showSnackbar(
        "Please provide a title and select an image.",
        "error",
        "",
        "3000"
      );
      return;
    }
    setUploading(true);
    setResponseMessage("Creating Banner");

    try {
      const bannerData = await createBanner({ file, title });
      if (!bannerData.success) {
        setResponseMessage(bannerData.message);
        setUploading(false);
        showSnackbar(bannerData.message, "error", "", "3000");
        return;
      }

      await uploadToS3({
        file,
        setProgress,
        setResponseMessage,
        bannerData,
        setUploading,
        setProgressVariant,
        onClose,
        setFile,
        fetchBanners,
        setTitle,
        showSnackbar,
      });
    } catch (error) {
      setResponseMessage(`Upload failed: ${error.message}`);
      setUploading(false);
      showSnackbar(`Upload failed: ${error.message}`, "error", "", "3000");
    }
  };

  const handleClose = () => {
    if (!uploading) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setFile(null);
      setTitle("");
      setResponseMessage("No file selected");
      onClose();
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            border: "1px solid var(--border-color)",
          },
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          padding="24px 24px 20px 24px"
        >
          <Stack gap="4px">
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "24px",
                fontWeight: 700,
                color: "var(--text1)",
              }}
            >
              Add Banner
            </Typography>
            <Typography
              sx={{
                fontSize: "13px",
                color: "var(--text3)",
              }}
            >
              Upload a new carousel banner image
            </Typography>
          </Stack>
          <IconButton onClick={handleClose} size="small" disabled={uploading}>
            <Close />
          </IconButton>
        </Stack>

        <Divider />

        <DialogContent sx={{ padding: "32px" }}>
          <Stack gap="24px">
            {/* Title Input */}
            <Stack gap="10px">
              <Typography
                sx={{
                  fontFamily: "Lato",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "var(--text1)",
                  letterSpacing: "0.3px",
                }}
              >
                Banner Title *
              </Typography>
              <StyledTextField
                placeholder="Enter a descriptive title for the banner"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploading}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "15px",
                    fontWeight: 500,
                  },
                }}
              />
            </Stack>

            {/* File Upload Section */}
            <Stack gap="10px">
              <Typography
                sx={{
                  fontFamily: "Lato",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "var(--text1)",
                  letterSpacing: "0.3px",
                }}
              >
                Banner Image *
              </Typography>

              <Stack
                sx={{
                  border: "2px dashed var(--border-color)",
                  borderRadius: "12px",
                  padding: "24px",
                  backgroundColor: file ? "rgba(76, 175, 80, 0.04)" : "#FAFAFA",
                  transition: "all 0.2s ease",
                  cursor: uploading ? "not-allowed" : "pointer",
                  "&:hover": {
                    borderColor: uploading
                      ? "var(--border-color)"
                      : "rgba(255, 152, 0, 0.5)",
                    backgroundColor: uploading
                      ? "#FAFAFA"
                      : "rgba(255, 152, 0, 0.02)",
                  },
                }}
                onClick={!uploading ? triggerFileInput : undefined}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png"
                  style={{ visibility: "hidden", position: "absolute" }}
                  disabled={uploading}
                />

                <Stack alignItems="center" gap="12px">
                  {previewUrl ? (
                    <Stack
                      sx={{
                        width: "100%",
                        maxWidth: "400px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "1px solid var(--border-color)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      }}
                    >
                      <img
                        src={previewUrl}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "auto",
                          display: "block",
                        }}
                      />
                    </Stack>
                  ) : (
                    <Stack
                      sx={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "12px",
                        backgroundColor: file
                          ? "rgba(76, 175, 80, 0.15)"
                          : "rgba(255, 152, 0, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {file ? (
                        <CheckCircle
                          sx={{ fontSize: "28px", color: "#4CAF50" }}
                        />
                      ) : (
                        <CloudUpload
                          sx={{ fontSize: "28px", color: "#FF9800" }}
                        />
                      )}
                    </Stack>
                  )}

                  <Stack alignItems="center" gap="4px">
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: file ? "#4CAF50" : "var(--text2)",
                      }}
                    >
                      {file ? file.name : "Click to select image"}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "var(--text3)",
                        textAlign: "center",
                      }}
                    >
                      Recommended: 1200px × 600px • JPEG or PNG • Max{" "}
                      {formatFileSize(MAX_FILE_SIZE)}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>

              {/* Status Message */}
              <Typography
                sx={{
                  fontSize: "13px",
                  color: isFileSizeExceed
                    ? "var(--delete-color)"
                    : "var(--text3)",
                  fontWeight: isFileSizeExceed ? 600 : 400,
                }}
              >
                {responseMessage}
              </Typography>
            </Stack>

            {/* Upload Progress */}
            {uploading && (
              <Stack gap="12px">
                <LinearProgress
                  variant={progressVariant}
                  value={progress}
                  sx={{
                    height: "8px",
                    borderRadius: "4px",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#FF9800",
                      borderRadius: "4px",
                    },
                    backgroundColor: "rgba(255, 152, 0, 0.15)",
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "var(--text2)",
                    textAlign: "center",
                  }}
                >
                  {progressVariant === "determinate"
                    ? `${Math.round(progress)}% uploaded`
                    : "Processing..."}
                </Typography>
              </Stack>
            )}
          </Stack>
        </DialogContent>

        {/* Footer */}
        <Divider />
        <Stack
          direction="row"
          justifyContent="flex-end"
          gap="12px"
          padding="20px 24px"
        >
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={uploading}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              padding: "8px 24px",
              fontWeight: 600,
              borderColor: "var(--border-color)",
              color: "var(--text2)",
              "&:hover": {
                borderColor: "var(--text3)",
                backgroundColor: "transparent",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={isFileSizeExceed || uploading || !file || !title}
            sx={{
              background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
              color: "#FFFFFF",
              textTransform: "none",
              borderRadius: "8px",
              padding: "8px 24px",
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": {
                background: "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
                boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)",
              },
              "&:disabled": {
                backgroundColor: "var(--text3)",
                color: "var(--white)",
                opacity: 0.5,
              },
            }}
          >
            {uploading ? "Uploading..." : "Upload Banner"}
          </Button>
        </Stack>
      </Dialog>

      {/* Crop Dialog */}
      <Dialog
        open={showCropDialog}
        onClose={handleCropCancel}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            border: "1px solid var(--border-color)",
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          padding="24px 24px 20px 24px"
        >
          <Stack gap="4px">
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--text1)",
              }}
            >
              Crop Banner Image
            </Typography>
            <Typography
              sx={{
                fontSize: "13px",
                color: "var(--text3)",
              }}
            >
              Adjust the crop area to 1200px × 600px
            </Typography>
          </Stack>
          <IconButton onClick={handleCropCancel} size="small">
            <Close />
          </IconButton>
        </Stack>

        <Divider />

        <DialogContent sx={{ padding: "24px" }}>
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(crop, percentCrop) => setCrop(crop)}
              aspect={1200 / 600}
              minWidth={1200}
              minHeight={600}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                onLoad={onImageLoad}
                alt="Crop preview"
                style={{ width: "auto", height: "auto", maxWidth: "100%" }}
              />
            </ReactCrop>
          )}
        </DialogContent>

        <Divider />

        <Stack
          direction="row"
          justifyContent="flex-end"
          gap="12px"
          padding="20px 24px"
        >
          <Button
            variant="outlined"
            onClick={handleCropCancel}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              padding: "8px 24px",
              fontWeight: 600,
              borderColor: "var(--border-color)",
              color: "var(--text2)",
              "&:hover": {
                borderColor: "var(--text3)",
                backgroundColor: "transparent",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCropConfirm}
            disabled={!crop}
            sx={{
              background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
              color: "#FFFFFF",
              textTransform: "none",
              borderRadius: "8px",
              padding: "8px 24px",
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": {
                background: "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
                boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)",
              },
              "&:disabled": {
                backgroundColor: "var(--text3)",
                color: "var(--white)",
                opacity: 0.5,
              },
            }}
          >
            Confirm Crop
          </Button>
        </Stack>
      </Dialog>
    </>
  );
}
