"use client";
import dynamic from "next/dynamic";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import DeleteDialogBox from "@/src/components/DeleteDialogBox/DeleteDialogBox";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import { apiFetch } from "@/src/lib/apiFetch";
import { CloudUpload, PlayCircle } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  DialogContent,
  Pagination,
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
import { useEffect, useState, useCallback, useMemo } from "react";
import CourseBankHeader from "../components/CourseBankHeader";
import ResourceCard from "../components/ResourceCard";
import axios from "axios";

const UploadFileDialog = dynamic(() =>
  import("../components/UploadFileDialog")
);
const UploadVideoDialog = dynamic(() =>
  import("../components/UploadVideoDialog")
);
const FilePreviewDialog = dynamic(() =>
  import("../components/FilePreviewDialog")
);
const StreamVideoDialog = dynamic(() =>
  import("../components/StreamVideoDialog")
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
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 24;

  const dialogOpenFile = () => setIsDialogFileOPen(true);
  const dialogCloseFile = () => setIsDialogFileOPen(false);

  const dialogOpenVideo = () => setIsDialogVideoOPen(true);
  const dialogCloseVideo = () => setIsDialogVideoOPen(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(1);
    if (newValue === "all") {
      setFilteredResources(resourceList);
    } else if (newValue === "streaming") {
      setFilteredResources(resourceList.filter((r) => r.type === "VIDEO"));
    } else if (newValue === "drive") {
      setFilteredResources(resourceList.filter((r) => r.type === "FILE"));
    }
  };

  const totalPages = Math.ceil(filteredResources.length / ITEMS_PER_PAGE);
  const paginatedResources = useMemo(
    () =>
      filteredResources.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
      ),
    [filteredResources, page]
  );

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

        // If request was aborted supported by isAborted flag or signal
        if (signal?.aborted || data.isAborted) return;

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
        if (!signal?.aborted) {
          setIsLoading(false);
        }
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
        countLabel={`${resourceList.length} ${resourceList.length === 1 ? "Resource" : "Resources"}`}
        subtitle="Upload and manage videos and files for this course"
        actions={[
          {
            label: "Upload File",
            icon: <CloudUpload />,
            onClick: dialogOpenFile,
            sx: {
              backgroundColor: "var(--primary-color)",
              color: "white",
              "&:hover": { backgroundColor: "var(--primary-color-dark)" },
            },
          },
          {
            label: "Add Video",
            icon: <PlayCircle />,
            onClick: dialogOpenVideo,
            sx: {
              backgroundColor: "var(--primary-color)",
              color: "white",
              "&:hover": { backgroundColor: "var(--primary-color-dark)" },
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
          borderRadius: "10px",
          padding: "16px",
          minHeight: "75vh",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb="12px"
          borderBottom="1px solid var(--border-color)"
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              minHeight: "36px",
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "12px",
                minWidth: "60px",
                minHeight: "36px",
                padding: "6px 12px",
              },
              "& .Mui-selected": {
                color: "var(--primary-color)",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "var(--primary-color)",
              },
            }}
          >
            <Tab label={`All (${resourceList.length})`} value="all" />
            <Tab label={`Streaming (${resourceList.filter((r) => r.type === "VIDEO").length})`} value="streaming" />
            <Tab label={`Drive (${resourceList.filter((r) => r.type === "FILE").length})`} value="drive" />
          </Tabs>
          <Typography
            sx={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text3)",
            }}
          >
            {filteredResources.length} Items
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "10px",
            width: "100%",
            alignContent: "start",
          }}
        >
          {!isLoading ? (
            paginatedResources.length > 0 ? (
              paginatedResources.map((item, index) => (
                <ResourceCard
                  key={index}
                  resource={item}
                  onAction={handleResourceAction}
                />
              ))
            ) : (
              <Box sx={{ gridColumn: "1 / -1", height: "50vh" }}>
                <NoDataFound info="No resources found" />
              </Box>
            )
          ) : (
            [...Array(8)].map((_, index) => (
              <SecondaryCardSkeleton key={index} variant="folder" />
            ))
          )}
        </Box>

        {totalPages > 1 && (
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            gap={1}
            mt="16px"
            pt="12px"
            borderTop="1px solid var(--border-color)"
          >
            <Typography
              sx={{ fontSize: "11px", color: "var(--text3)", fontWeight: 500 }}
            >
              Page {page} of {totalPages}
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => {
                setPage(value);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              size="small"
              shape="rounded"
              sx={{
                "& .MuiPaginationItem-root": {
                  fontWeight: 600,
                  fontSize: "12px",
                  minWidth: "30px",
                  height: "30px",
                  borderRadius: "8px",
                  color: "var(--text2)",
                  border: "1px solid var(--border-color)",
                  "&:hover": {
                    backgroundColor: "rgba(24, 113, 99, 0.08)",
                    borderColor: "var(--primary-color)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "var(--primary-color)",
                    color: "white",
                    borderColor: "var(--primary-color)",
                    "&:hover": {
                      backgroundColor: "var(--primary-color-dark)",
                    },
                  },
                },
                "& .MuiPaginationItem-previousNext": {
                  border: "1px solid var(--border-color)",
                  "&:hover": {
                    backgroundColor: "rgba(24, 113, 99, 0.08)",
                    borderColor: "var(--primary-color)",
                  },
                },
              }}
            />
          </Stack>
        )}
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
                height: "36px",
                fontSize: "13px",
                fontWeight: 600,
              }}
              disableElevation
            >
              {isLoading ? (
                <CircularProgress size={18} sx={{ color: "var(--white)" }} />
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
                height: "36px",
                fontSize: "13px",
                fontWeight: 600,
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

      <Dialog open={isDownloading} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "14px" } }}>
        <DialogTitle sx={{ fontSize: "14px", fontWeight: 700, padding: "16px 20px 8px" }}>
          Downloading...
        </DialogTitle>
        <DialogContent sx={{ padding: "8px 20px 16px" }}>
          <Stack gap="4px">
            <LinearProgress
              variant="determinate"
              value={downloadProgress}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: "var(--border-color)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "var(--primary-color)",
                  borderRadius: 2,
                },
              }}
            />
            <Typography align="right" fontSize="11px" fontWeight={700} color="var(--text2)">
              {downloadProgress}%
            </Typography>
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
