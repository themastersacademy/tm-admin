"use client";
import {
  Button,
  DialogContent,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
  Dialog,
} from "@mui/material";
import StyledTextField from "../StyledTextField/StyledTextField";
import { useState, useRef } from "react";
import DialogBox from "../DialogBox/DialogBox";
import { Close, East } from "@mui/icons-material";
import { createBanner, uploadToS3 } from "@/src/lib/uploadBanner";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

export default function BannerUpload({ isOpen, onClose, fetchBanners, showSnackbar }) {
  const MAX_FILE_SIZE = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_BANNER_SIZE_MB) * 1024 * 1024;
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
  const imgRef = useRef(null);

  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    else return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

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
        `File size ${fileSizeDisplay}. Max limit is ${formatFileSize(MAX_FILE_SIZE)}`
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
    finalCtx.imageSmoothingQuality = 'high'; 
    finalCtx.drawImage(canvas, 0, 0, 1200, 600);

    return new Promise((resolve) => {
      finalCanvas.toBlob((blob) => {
        const croppedFile = new File([blob], file?.name || "cropped-image.jpg", {
          type: "image/jpeg",
        });
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
        `Cropped file size ${fileSizeDisplay}. Max limit is ${formatFileSize(MAX_FILE_SIZE)}`
      );
      setShowCropDialog(false);
      return;
    }

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
      showSnackbar("Please provide a title and select an image.", "error", "", "3000");
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

  return (
    <>
      <DialogBox
        isOpen={isOpen}
        icon={
          <IconButton
            onClick={() => {
              setFile(null);
              setTitle("");
              setResponseMessage("No file selected");
              onClose();
            }}
            sx={{ borderRadius: "10px", padding: "6px" }}
            disabled={uploading}
          >
            <Close sx={{ color: "var(--text2)" }} />
          </IconButton>
        }
        title="Add Banner"
        actionButton={
          <Button
            variant="text"
            endIcon={<East />}
            onClick={handleUpload}
            sx={{ textTransform: "none", color: "var(--primary-color)" }}
            disabled={isFileSizeExceed || uploading || !file || !title}
          >
            Upload
          </Button>
        }
      >
        <DialogContent>
          <Stack gap="15px">
            <StyledTextField
              placeholder="Enter Banner title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
            />
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                width: "100%",
                height: "40px",
                border: "1px solid var(--border-color)",
                borderRadius: "4px",
                padding: "8px",
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png"
                style={{ visibility: "hidden", position: "absolute" }}
                disabled={uploading}
              />
              {file ? (
                <Typography>{file.name}</Typography>
              ) : (
                <Typography>Select Image (1200px x 600px)</Typography>
              )}
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "var(--primary-color)",
                  height: "30px",
                  textTransform: "none",
                  marginLeft: "auto",
                  minWidth: "130px",
                }}
                onClick={triggerFileInput}
                disabled={uploading}
              >
                Choose File
              </Button>
            </Stack>
            <Typography
              color={isFileSizeExceed ? "error" : ""}
              sx={{ fontSize: "12px" }}
            >
              {responseMessage}
            </Typography>
            {uploading && (
              <Stack gap={1}>
                <LinearProgress
                  variant={progressVariant}
                  value={progress}
                  sx={{
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "var(--sec-color)",
                    },
                    backgroundColor: "var(--sec-color-acc-2)",
                  }}
                />
                <Typography fontSize={14}></Typography>
              </Stack>
            )}
          </Stack>
        </DialogContent>
      </DialogBox>

      {/* Crop Dialog */}
      <Dialog open={showCropDialog} onClose={handleCropCancel}>
        <DialogContent>
          <Typography variant="h6">Crop Image to 1200px x 600px</Typography>
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(crop, percentCrop) => setCrop(crop)} // Use pixel crop
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
          <Stack direction="row" justifyContent="flex-end" gap={2} mt={2}>
            <Button sx={{ color: "var(--primary-color)" }} onClick={handleCropCancel}>Cancel</Button>
            <Button
              sx={{
                backgroundColor: "var(--primary-color)",
                height: "30px",
                marginLeft: "auto",
                minWidth: "130px",
              }}
              variant="contained"
              onClick={handleCropConfirm}
              disabled={!crop}
            >
              Confirm Crop
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}