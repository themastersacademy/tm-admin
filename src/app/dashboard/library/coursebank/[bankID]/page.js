"use client";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import DeleteDialogBox from "@/src/components/DeleteDialogBox/DeleteDialogBox";
import FileUpload from "@/src/components/FileUpload/FileUpload";
import Header from "@/src/components/Header/Header";
import LongDialogBox from "@/src/components/LongDialogBox/LongDialogBox";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import VideoPlayer from "@/src/components/VideoPlayer/VideoPlayer";
import VideoUpload from "@/src/components/VideoUpload/VideoUpload";
import { apiFetch } from "@/src/lib/apiFetch";
import {
  Add,
  Delete,
  DriveFileRenameOutlineRounded,
  FileDownloadRounded,
  InsertDriveFile,
  PlayArrowRounded,
  PlayCircle,
} from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  DialogContent,
  Divider,
  MenuItem,
  Skeleton,
  Stack,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CourseBankId() {
  const { bankID } = useParams();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [bank, setBank] = useState({});
  const [resourceList, setResourceList] = useState([]);
  const [isDialogFileOpen, setIsDialogFileOPen] = useState(false);
  const [isDialogVideoOpen, setIsDialogVideoOPen] = useState(false);
  const [isDialogDeleteOpen, setIsDialogDeleteOpen] = useState(false);
  const [selectedResourceID, setSelectedResourceID] = useState(null);
  const [selectedResourceName, setSelectedResourceName] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const dialogOpenFile = () => {
    setIsDialogFileOPen(true);
  };
  const dialogCloseFile = () => {
    setIsDialogFileOPen(false);
  };

  const dialogOpenVideo = () => {
    setIsDialogVideoOPen(true);
  };
  const dialogCloseVideo = () => {
    setIsDialogVideoOPen(false);
  };

  const dialogOpenDelete = (resourceID, resourceName) => {
    setSelectedResourceID(resourceID);
    setSelectedResourceName(resourceName);
    setIsDialogDeleteOpen(true);
  };
  const dialogCloseDelete = () => {
    setIsDialogDeleteOpen(false);
  };

  const videoPlayerOpen = () => {
    setIsVideoPlayerOpen(true);
  };
  const videoPlayerClose = () => {
    setIsVideoPlayerOpen(false);
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  const fetchCourse = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/bank/get-bank/${bankID}`
      );
      if (data.success) {
        setBank(data.data);
        setResourceList(data.data.resources);
      } else {
        showSnackbar("No Bank Found", "error", "", "3000");
        router.push(`/404`);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching course data:", error);
    }
  };

  const downloadFile = async ({ path }) => {
    try {
      const data = await apiFetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/api/bank/resource/get-file?path=${encodeURIComponent(path)}`
      );
      if (!data.success || !data.url) {
        // router.push("/404");
        return;
      }
      const response = await fetch(data.url);
      if (!response.ok) {
        router.push("/404");
        return;
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const fileDownload = document.createElement("a");
      fileDownload.href = downloadUrl;
      fileDownload.download = "download";
      document.body.appendChild(fileDownload);
      fileDownload.click();
      document.body.removeChild(fileDownload);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      router.push("/404");
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

  const handleDelete = async (resourceID, bankID) => {
    setIsLoading(true);
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/bank/resource/delete-resource`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resourceID, bankID }),
        }
      );
      if (data.success) {
        fetchCourse();
        showSnackbar(data.message, "success", "", "3000");
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error deleting course  :", error);
    }
  };

  return (
    <Stack padding="20px" gap="20px">
      <Header
        title={
          bank.bankTitle ? (
            bank.bankTitle
          ) : (
            <Skeleton variant="text" animation="wave" width="100px" />
          )
        }
        search
        button={[
          <Button
            key="Add"
            variant="contained"
            startIcon={<Add />}
            onClick={dialogOpenFile}
            sx={{
              backgroundColor: "var(--primary-color)",
              textTransform: "none",
            }}
            disableElevation
          >
            File
          </Button>,
          <Button
            key="file"
            variant="contained"
            startIcon={<Add />}
            onClick={dialogOpenVideo}
            sx={{
              backgroundColor: "var(--primary-color)",
              textTransform: "none",
            }}
            disableElevation
          >
            Video
          </Button>,
        ]}
        back
      />
      <FileUpload
        isOpen={isDialogFileOpen}
        onClose={dialogCloseFile}
        bankID={bankID}
        fetchCourse={fetchCourse}
      />
      <VideoUpload
        isOpen={isDialogVideoOpen}
        onClose={dialogCloseVideo}
        bankID={bankID}
        fetchCourse={fetchCourse}
      />
      <Stack
        sx={{
          border: "1px solid var(--border-color)",
          backgroundColor: "var(--white)",
          borderRadius: "10px",
          padding: "20px",
          minHeight: "80vh",
        }}
      >
        <Stack
          flexDirection="row"
          columnGap="40px"
          rowGap="15px"
          flexWrap="wrap"
        >
          {!isLoading ? (
            resourceList.length > 0 ? (
              resourceList.map((item, index) => (
                <SecondaryCard
                  key={index}
                  icon={
                    item.type === "VIDEO" ? (
                      <PlayCircle
                        sx={{ color: "var(--sec-color)" }}
                        fontSize="large"
                      />
                    ) : (
                      <InsertDriveFile
                        sx={{ color: "var(--sec-color)" }}
                        fontSize="large"
                      />
                    )
                  }
                  title={item.name}
                  options={[
                    item.type === "VIDEO" ? (
                      <MenuItem
                        key="one"
                        onClick={() => {
                          playVideo({ videoID: item.resourceID });
                          videoPlayerOpen();
                        }}
                        sx={{
                          gap: "10px",
                          padding: "5px 12px",
                          fontSize: "13px",
                        }}
                      >
                        <PlayArrowRounded
                          fontSize="small"
                          sx={{ fontSize: "16px" }}
                        />
                        Play
                      </MenuItem>
                    ) : (
                      <MenuItem
                        key="one"
                        onClick={() => downloadFile({ path: item.path })}
                        sx={{
                          gap: "10px",
                          padding: "5px 12px",
                          fontSize: "13px",
                        }}
                      >
                        <FileDownloadRounded
                          fontSize="small"
                          sx={{ fontSize: "16px" }}
                        />
                        Download
                      </MenuItem>
                    ),
                    <MenuItem
                      key="one"
                      sx={{
                        gap: "10px",
                        padding: "5px 12px",
                        fontSize: "13px",
                      }}
                    >
                      <DriveFileRenameOutlineRounded
                        sx={{ fontSize: "15px" }}
                      />
                      Rename
                    </MenuItem>,
                    <Divider key="2" />,
                    <MenuItem
                      key="two"
                      onClick={() => {
                        dialogOpenDelete(item.resourceID, item.name);
                      }}
                      sx={{
                        gap: "10px",
                        color: "var(--delete-color)",
                        padding: "5px 12px",
                        fontSize: "13px",
                      }}
                      name={item.name}
                      disableRipple
                    >
                      <Delete fontSize="small" sx={{ fontSize: "16px" }} />
                      Delete
                    </MenuItem>,
                  ]}
                  cardWidth="350px"
                />
              ))
            ) : (
              <Stack sx={{ width: "100%", height: "60vh" }}>
                <NoDataFound info="No resources created yet" />
              </Stack>
            )
          ) : (
            [...Array(3)].map((_, index) => (
              <SecondaryCardSkeleton key={index} />
            ))
          )}

          <DeleteDialogBox
            isOpen={isDialogDeleteOpen}
            onClose={dialogCloseDelete}
            name={selectedResourceName}
            actionButton={
              <Stack
                flexDirection="row"
                justifyContent="center"
                sx={{ gap: "20px", width: "100%" }}
              >
                <Button
                  variant="contained"
                  onClick={() => {
                    handleDelete(selectedResourceID, bankID);
                    dialogCloseDelete();
                  }}
                  sx={{
                    textTransform: "none",
                    backgroundColor: "var(--delete-color)",
                    borderRadius: "5px",
                    width: "130px",
                  }}
                  disableElevation
                >
                  {isLoading ? (
                    <CircularProgress
                      size={20}
                      sx={{ color: "var(--white)" }}
                    />
                  ) : (
                    "Delete"
                  )}
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    borderRadius: "5px",
                    backgroundColor: "white",
                    color: "var(--text2)",
                    border: "1px solid var(--border-color)",
                    width: "130px",
                  }}
                  onClick={dialogCloseDelete}
                  disableElevation
                >
                  Cancel
                </Button>
              </Stack>
            }
          />
        </Stack>
        <LongDialogBox isOpen={isVideoPlayerOpen} onClose={videoPlayerClose}>
          <DialogContent>
            {videoURL && <VideoPlayer videoURL={videoURL} />}
          </DialogContent>
        </LongDialogBox>
      </Stack>
    </Stack>
  );
}
