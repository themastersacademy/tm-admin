"use client";
import { Add, Close, Delete, East, Edit } from "@mui/icons-material";
import {
  Avatar,
  Button,
  DialogContent,
  IconButton,
  MenuItem,
  Stack,
  Typography,
  CircularProgress
} from "@mui/material";
import Header from "@/src/components/Header/Header";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import BannerUpload from "@/src/components/BannerUpload/BannerUpload";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import { apiFetch } from "@/src/lib/apiFetch";
import Image from "next/image";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { useEffect, useState } from "react";
import BannerCard from "@/src/components/BannerCard/BannerCard";
import DeleteDialogBox from "@/src/components/DeleteDialogBox/DeleteDialogBox";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BannerDialogBox from "@/src/components/BannerDialogBox/BannerDialogBox";

export default function Profile() {
  const { showSnackbar } = useSnackbar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [previewBannerURL, setPreviewBannerURL] = useState(null);
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const dialogOpen = () => {
    setIsDialogOpen(true);
  };
  const dialogClose = () => {
    setIsDialogOpen(false);
  };

  const deleteDialogOpen = (banner) => {
    setSelectedBanner(banner);
    setIsDeleteDialogOpen(true);
  };

  const deleteDialogClose = () => {
    setSelectedBanner(null);
    setIsDeleteDialogOpen(false);
  };

  const previewDialogOpen = (bannerURL) => {
    setPreviewBannerURL(bannerURL);
    setIsPreviewDialogOpen(true);
  };

  const previewDialogClose = () => {
    setPreviewBannerURL(null);
    setIsPreviewDialogOpen(false);
  };

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch("/api/banner");
      if (data.success) {
        // Sort banners by createdAt in descending order (newest first)
        const sortedBanners = data.data.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setBanners(sortedBanners);
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching banners:", error);
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBanner) {
      showSnackbar("No banner selected for deletion", "error", "", "3000");
      return;
    }
    setDeleteLoading(true);

    try {
      const data = await apiFetch("/api/banner", {
        method: "DELETE",
        body: JSON.stringify({
          bannerID: selectedBanner.bannerID,
          path: selectedBanner.path,
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (data.success) {
        fetchBanners();
        showSnackbar(data.message, "success", "", "3000");
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
      showSnackbar("Error deleting banner", "error", "", "3000");
    } finally {
      setDeleteLoading(false);
    }
    deleteDialogClose();
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <Stack
      padding="20px"
      gap="20px"
      sx={{ minHeight: "100vh", overflowY: "visible" }}
    >
      <Header title="Profile" />
      <Stack
        sx={{
          border: "1px solid var(--border-color)",
          borderRadius: "10px",
          width: "100%",
          maxWidth: "900px",
          minHeight: "300px",
          backgroundColor: "var(--white)",
          padding: "20px",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <Stack flexDirection="row" justifyContent="space-between">
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "18px",
              fontWeight: "700",
              color: "var(--text3)",
            }}
          >
            Personal details
          </Typography>
          <Button
            variant="text"
            endIcon={<Edit />}
            sx={{
              textTransform: "none",
              fontFamily: "Lato",
              fontSize: "16px",
              color: "var(--primary-color)",
              padding: "2px",
            }}
          >
            Edit
          </Button>
        </Stack>
        <Stack>
          <Avatar sx={{ width: "80px", height: "80px" }} />
        </Stack>
        <Stack>
          <hr />
        </Stack>
        <Stack
          gap="20px"
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            flexWrap: "wrap",
          }}
        >
          <Stack gap="10px">
            <Typography>Name</Typography>
            <StyledTextField placeholder="Your Name" sx={{ width: "100%" }} />
          </Stack>
          <Stack gap="10px">
            <Typography>Email</Typography>
            <StyledTextField placeholder="Your Email" sx={{ width: "100%" }} />
          </Stack>
          <Stack gap="10px">
            <Typography>Phone</Typography>
            <StyledTextField placeholder="Your Number" sx={{ width: "100%" }} />
          </Stack>
        </Stack>
      </Stack>
      <Stack
        sx={{
          border: "1px solid var(--border-color)",
          borderRadius: "10px",
          backgroundColor: "var(--white)",
          height: "auto",
          width: "900px",
          padding: "20px",
          gap: "15px",
        }}
      >
        <Stack flexDirection="row" justifyContent="space-between">
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "18px",
              fontWeight: "700",
              color: "var(--text3)",
            }}
          >
            Home Banner
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={dialogOpen}
            sx={{
              textTransform: "none",
              width: "100px",
              backgroundColor: "var(--primary-color)",
            }}
          >
            Add
          </Button>
        </Stack>
        <BannerUpload
          isOpen={isDialogOpen}
          onClose={dialogClose}
          fetchBanners={fetchBanners}
          showSnackbar={showSnackbar}
        />
        <Stack flexDirection="row" gap="20px" flexWrap="wrap">
          {!isLoading ? (
            banners.length > 0 ? (
              banners.map((banner, index) => (
                <BannerCard
                  key={banner.bannerID} 
                  cardWidth="400px"
                  title={banner.title}
                  icon={
                    <Image
                      src={banner.bannerURL}
                      alt="Banner"
                      width={65}
                      height={60}
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                        borderRadius: "10px",
                      }}
                    />
                  }
                  options={[
                    <MenuItem
                      key="preview"
                      onClick={() => previewDialogOpen(banner.bannerURL)}
                      sx={{
                        color: "var(--text2)",
                        gap: "5px",
                        fontSize: "14px",
                        padding: "5px",
                      }}
                    >
                      <VisibilityIcon sx={{ fontSize: "16px" }} />
                      Preview
                    </MenuItem>,
                    <MenuItem
                      key="delete"
                      onClick={() => deleteDialogOpen(banner)}
                      sx={{
                        color: "var(--delete-color)",
                        gap: "5px",
                        fontSize: "14px",
                        padding: "5px",
                      }}
                    >
                      <Delete sx={{ fontSize: "16px" }} />
                      Delete
                    </MenuItem>,
                  ]}
                />
              ))
            ) : (
              <Stack sx={{ width: "100%", height: "100%" }}>
                <NoDataFound info="No banners created yet" />
              </Stack>
            )
          ) : (
            [...Array(3)].map((_, index) => (
              <BannerCard key={index} cardWidth="350px" />
            ))
          )}
        </Stack>
      </Stack>
      <DeleteDialogBox
        isOpen={isDeleteDialogOpen}
        onClose={deleteDialogClose}
        actionButton={
          <Stack
            flexDirection="row"
            justifyContent="center"
            sx={{ gap: "20px", width: "100%" }}
          >
            <Button
              variant="contained"
              onClick={handleDelete}
              disabled={deleteLoading}
              sx={{
                textTransform: "none",
                backgroundColor: "var(--delete-color)",
                borderRadius: "5px",
                width: "130px",
              }}
              disableElevation
            >
              {deleteLoading ? (
                <>
                  <CircularProgress size={20} sx={{ color: "var(--primary-color)" }} />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
            <Button
              variant="contained"
              onClick={deleteDialogClose}
              disabled={deleteLoading}
              sx={{
                textTransform: "none",
                borderRadius: "5px",
                backgroundColor: "white",
                color: "var(--text2)",
                border: "1px solid var(--border-color)",
                width: "130px",
              }}
              disableElevation
            >
              Cancel
            </Button>
          </Stack>
        }
      />
      <BannerDialogBox
        isOpen={isPreviewDialogOpen}
        onClose={previewDialogClose}
        bannerURL={previewBannerURL}
      />
    </Stack>
  );
}