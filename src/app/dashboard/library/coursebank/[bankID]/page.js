"use client";
import dynamic from "next/dynamic";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import DeleteDialogBox from "@/src/components/DeleteDialogBox/DeleteDialogBox";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import { apiFetch } from "@/src/lib/apiFetch";
import { CloudUpload, PlayCircle } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  DialogContent,
  Skeleton,
  Stack,
  Typography,
  Tab,
  Tabs,
  LinearProgress,
  Dialog,
  DialogTitle,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import CourseBankHeader from "../Components/CourseBankHeader";
import ResourceCard from "../Components/ResourceCard";
import axios from "axios";

const UploadFileDialog = dynamic(() =>
  import("../Components/UploadFileDialog")
);
const UploadVideoDialog = dynamic(() =>
  import("../Components/UploadVideoDialog")
);
const FilePreviewDialog = dynamic(() =>
  import("../Components/FilePreviewDialog")
);
const StreamVideoDialog = dynamic(() =>
  import("../Components/StreamVideoDialog")
);

export default function CourseBankId() {
  const { bankID } = useParams();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [bank, setBank] = useState({});
  const [resourceList, setResourceList] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  const [isDialogFileOpen, setIsDialogFileOPen] = useState(false);
  const [isDialogVideoOpen, setIsDialogVideoOPen] = useState(false);
  const [isDialogDeleteOpen, setIsDialogDeleteOpen] = useState(false);

  const [selectedResourceID, setSelectedResourceID] = useState(null);
  const [selectedResourceName, setSelectedResourceName] = useState(null);

  const [videoURL, setVideoURL] = useState(null);
  const [selectedVideoResource, setSelectedVideoResource] = useState(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewName, setPreviewName] = useState("");
  const [previewPath, setPreviewPath] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const dialogOpenFile = () => setIsDialogFileOPen(true);
  const dialogCloseFile = () => setIsDialogFileOPen(false);

  const dialogOpenVideo = () => setIsDialogVideoOPen(true);
  const dialogCloseVideo = () => setIsDialogVideoOPen(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === "all") {
      setFilteredResources(resourceList);
    } else if (newValue === "streaming") {
      setFilteredResources(resourceList.filter((r) => r.type === "VIDEO"));
    } else if (newValue === "drive") {
      setFilteredResources(resourceList.filter((r) => r.type === "FILE"));
    }
  };

  const handleResourceAction = (action, resource) => {
    if (action === "delete") {
      setSelectedResourceID(resource.resourceID);
      setSelectedResourceName(resource.name);
      setIsDialogDeleteOpen(true);
    } else if (action === "play") {
      setSelectedVideoResource(resource);
      playVideo({ videoID: resource.resourceID });
      setIsVideoPlayerOpen(true);
    } else if (action === "download") {
      downloadFile(resource);
    } else if (action === "preview") {
      handlePreview(resource);
    }
  };

  const dialogCloseDelete = () => setIsDialogDeleteOpen(false);
  const videoPlayerClose = () => setIsVideoPlayerOpen(false);
  const previewClose = () => {
    setIsPreviewOpen(false);
    setPreviewUrl(null);
  };

  const fetchCourse = useCallback(
    async (signal) => {
      setIsLoading(true);
      try {
        const abortSignal = signal instanceof AbortSignal ? signal : null;
        const data = await apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/bank/get-bank/${bankID}`,
          { signal: abortSignal }
        );
        if (data.success) {
          setBank(data.data);
          setResourceList(data.data.resources);
          // Apply current filter
          if (activeTab === "all") {
            setFilteredResources(data.data.resources);
          } else if (activeTab === "streaming") {
            setFilteredResources(
              data.data.resources.filter((r) => r.type === "VIDEO")
            );
          } else if (activeTab === "drive") {
            setFilteredResources(
              data.data.resources.filter((r) => r.type === "FILE")
            );
          }
        } else {
          showSnackbar("No Bank Found", "error", "", "3000");
          router.push(`/404`);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching course data:", error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [bankID, activeTab, showSnackbar, router]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchCourse(controller.signal);
    return () => controller.abort();
  }, [fetchCourse]);

  const handlePreview = async (resource) => {
    try {
      const data = await apiFetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/api/bank/resource/get-file?path=${encodeURIComponent(resource.path)}`
      );
      if (data.success && data.url) {
        const extension = resource.path.split(".").pop().toLowerCase();
        if (
          ["jpg", "jpeg", "png", "gif", "webp", "mp4", "webm", "ogg"].includes(
            extension
          )
        ) {
          setPreviewUrl(data.url);
          setPreviewName(resource.name);
          setPreviewPath(resource.path);
          setIsPreviewOpen(true);
        } else if (extension === "pdf") {
          window.open(data.url, "_blank");
        } else {
          // Fallback to download if preview not supported
          downloadFile(resource);
        }
      } else {
        showSnackbar("Failed to get preview URL", "error", "", "3000");
      }
    } catch (error) {
      console.error("Error previewing file:", error);
      showSnackbar("Error previewing file", "error", "", "3000");
    }
  };

  const downloadFile = async (resource) => {
    setIsDownloading(true);
    setDownloadProgress(0);
    try {
      const data = await apiFetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/api/bank/resource/get-file?path=${encodeURIComponent(resource.path)}`
      );
      if (!data.success || !data.url) {
        showSnackbar("Failed to get download URL", "error", "", "3000");
        setIsDownloading(false);
        return;
      }

      const response = await axios.get(data.url, {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setDownloadProgress(percentCompleted);
        },
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const fileDownload = document.createElement("a");
      fileDownload.href = downloadUrl;

      // Extract extension from path
      const extension = resource.path.split(".").pop();
      let fileName = resource.name;
      if (!fileName.endsWith(`.${extension}`)) {
        fileName += `.${extension}`;
      }

      fileDownload.download = fileName;
      document.body.appendChild(fileDownload);
      fileDownload.click();
      document.body.removeChild(fileDownload);
      window.URL.revokeObjectURL(downloadUrl);
      showSnackbar("Download completed", "success", "", "3000");
    } catch (error) {
      console.error("Error downloading file:", error);
      showSnackbar("Error downloading file", "error", "", "3000");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const playVideo = async ({ videoID }) => {
    const data = await apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/bank/resource/get-video?resourceID=${videoID}`
    );
    if (data.success) {
      setVideoURL(data.videoURL);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/bank/resource/delete-resource`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resourceID: selectedResourceID, bankID }),
        }
      );
      if (data.success) {
        fetchCourse();
        showSnackbar(data.message, "success", "", "3000");
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
      setIsLoading(false);
      dialogCloseDelete();
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  return (
    <Stack padding="20px" gap="24px">
      <CourseBankHeader
        title={bank.bankTitle || <Skeleton width={200} />}
        breadcrumbs={[
          { label: "Course Bank", href: "/dashboard/library/coursebank" },
          { label: bank.bankTitle || "Loading..." },
        ]}
        actions={[
          {
            label: "Upload File",
            icon: <CloudUpload />,
            onClick: dialogOpenFile,
            sx: {
              background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
              color: "white",
            },
          },
          {
            label: "Add Video",
            icon: <PlayCircle />,
            onClick: dialogOpenVideo,
            sx: {
              background: "linear-gradient(135deg, #F44336 0%, #D32F2F 100%)",
              color: "white",
            },
          },
        ]}
      />

      <UploadFileDialog
        open={isDialogFileOpen}
        onClose={dialogCloseFile}
        bankID={bankID}
        fetchCourse={fetchCourse}
      />
      <UploadVideoDialog
        open={isDialogVideoOpen}
        onClose={dialogCloseVideo}
        bankID={bankID}
        fetchCourse={fetchCourse}
      />

      <Stack
        sx={{
          border: "1px solid var(--border-color)",
          backgroundColor: "var(--white)",
          borderRadius: "16px",
          padding: "24px",
          minHeight: "75vh",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          borderBottom="1px solid var(--border-color)"
          pb={2}
        >
          <Stack direction="row" gap={4}>
            <Stack>
              <Typography fontSize="12px" color="var(--text3)">
                Streaming
              </Typography>
              <Typography fontSize="16px" fontWeight={700}>
                {resourceList.filter((r) => r.type === "VIDEO").length}
              </Typography>
            </Stack>
            <Stack>
              <Typography fontSize="12px" color="var(--text3)">
                Drive Files
              </Typography>
              <Typography fontSize="16px" fontWeight={700}>
                {resourceList.filter((r) => r.type === "FILE").length}
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          borderBottom="1px solid var(--border-color)"
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "14px",
                minWidth: "80px",
              },
              "& .Mui-selected": {
                color: "var(--primary-color)",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "var(--primary-color)",
              },
            }}
          >
            <Tab label="All Resources" value="all" />
            <Tab label="Streaming" value="streaming" />
            <Tab label="Drive" value="drive" />
          </Tabs>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--text2)",
            }}
          >
            {filteredResources.length} Items
          </Typography>
        </Stack>

        <Stack flexDirection="row" gap="24px" flexWrap="wrap">
          {!isLoading ? (
            filteredResources.length > 0 ? (
              filteredResources.map((item, index) => (
                <ResourceCard
                  key={index}
                  resource={item}
                  onAction={handleResourceAction}
                />
              ))
            ) : (
              <Stack width="100%" height="50vh">
                <NoDataFound info="No resources found" />
              </Stack>
            )
          ) : (
            [...Array(4)].map((_, index) => (
              <SecondaryCardSkeleton key={index} />
            ))
          )}
        </Stack>
      </Stack>

      <DeleteDialogBox
        isOpen={isDialogDeleteOpen}
        onClose={dialogCloseDelete}
        name={selectedResourceName}
        actionButton={
          <Stack
            flexDirection="row"
            justifyContent="center"
            sx={{ gap: "16px", width: "100%" }}
          >
            <Button
              variant="contained"
              onClick={handleDelete}
              sx={{
                textTransform: "none",
                backgroundColor: "var(--delete-color)",
                borderRadius: "8px",
                width: "120px",
                height: "44px",
              }}
              disableElevation
            >
              {isLoading ? (
                <CircularProgress size={20} sx={{ color: "var(--white)" }} />
              ) : (
                "Delete"
              )}
            </Button>
            <Button
              variant="outlined"
              onClick={dialogCloseDelete}
              sx={{
                textTransform: "none",
                borderRadius: "8px",
                color: "var(--text2)",
                borderColor: "var(--border-color)",
                width: "120px",
                height: "44px",
              }}
            >
              Cancel
            </Button>
          </Stack>
        }
      />

      <StreamVideoDialog
        open={isVideoPlayerOpen}
        onClose={videoPlayerClose}
        videoUrl={videoURL}
        videoTitle={selectedVideoResource?.name}
        videoDate={selectedVideoResource?.createdAt}
      />

      <FilePreviewDialog
        open={isPreviewOpen}
        onClose={previewClose}
        fileUrl={previewUrl}
        fileName={previewName}
        filePath={previewPath}
      />

      <Dialog open={isDownloading} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 600 }}>
          Downloading...
        </DialogTitle>
        <DialogContent>
          <Stack gap={1}>
            <LinearProgress
              variant="determinate"
              value={downloadProgress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "var(--border-color)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "var(--primary-color)",
                },
              }}
            />
            <Typography align="right" fontSize="12px" color="var(--text2)">
              {downloadProgress}%
            </Typography>
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
