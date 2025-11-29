"use client";
import { useState, useEffect } from "react";
import { Stack, Button, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import BannerUpload from "@/src/components/BannerUpload/BannerUpload";
import BannerCard from "@/src/components/BannerCard/BannerCard";
import DeleteDialogBox from "@/src/components/DeleteDialogBox/DeleteDialogBox";
import BannerDialogBox from "@/src/components/BannerDialogBox/BannerDialogBox";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import Image from "next/image";

export default function BannerManagement() {
  const { showSnackbar } = useSnackbar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [previewBannerURL, setPreviewBannerURL] = useState(null);
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch("/api/banner");
      if (data.success) {
        const sortedBanners = data.data.sort(
          (a, b) => b.createdAt - a.createdAt
        );
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
    if (!selectedBanner) return;
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
      setIsDeleteDialogOpen(false);
      setSelectedBanner(null);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <Stack gap="24px">
      {/* Header Section with Stats */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        padding="20px 24px"
        sx={{
          background:
            "linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(245, 124, 0, 0.02) 100%)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 152, 0, 0.15)",
        }}
      >
        <Stack gap="8px">
          <Stack direction="row" alignItems="center" gap="12px">
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--text1)",
              }}
            >
              Carousel Banners
            </Typography>
            {!isLoading && (
              <Stack
                sx={{
                  backgroundColor: "rgba(255, 152, 0, 0.12)",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  border: "1px solid rgba(255, 152, 0, 0.25)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#FF9800",
                  }}
                >
                  {banners.length} {banners.length === 1 ? "Banner" : "Banners"}
                </Typography>
              </Stack>
            )}
          </Stack>
          <Typography sx={{ fontSize: "13px", color: "var(--text3)" }}>
            Manage carousel images displayed on the user app home page
          </Typography>
        </Stack>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsDialogOpen(true)}
          sx={{
            background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
            color: "#FFFFFF",
            textTransform: "none",
            borderRadius: "10px",
            padding: "10px 24px",
            fontWeight: 700,
            fontSize: "14px",
            boxShadow: "0 4px 12px rgba(255, 152, 0, 0.25)",
            minWidth: "140px",
            height: "48px",
            "&:hover": {
              background: "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
              boxShadow: "0 6px 16px rgba(255, 152, 0, 0.35)",
              transform: "translateY(-1px)",
            },
          }}
          disableElevation
        >
          Add Banner
        </Button>
      </Stack>

      {/* Banner Cards Grid */}
      <Stack
        direction="row"
        gap="16px"
        flexWrap="wrap"
        sx={{
          "& > *": {
            flex: "0 1 calc(25% - 12px)", // 4 cards per row
            minWidth: "240px",
            maxWidth: "300px",
          },
        }}
      >
        {!isLoading ? (
          banners.length > 0 ? (
            banners.map((banner) => (
              <BannerCard
                key={banner.bannerID}
                cardWidth="100%"
                title={banner.title}
                icon={
                  <Image
                    src={banner.bannerURL}
                    alt="Banner"
                    width={300}
                    height={150}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                }
                onClick={() => {
                  setPreviewBannerURL(banner.bannerURL);
                  setIsPreviewDialogOpen(true);
                }}
                onDelete={() => {
                  setSelectedBanner(banner);
                  setIsDeleteDialogOpen(true);
                }}
              />
            ))
          ) : (
            <Stack sx={{ width: "100%", minHeight: "300px" }}>
              <NoDataFound info="No banners created yet" />
            </Stack>
          )
        ) : (
          [...Array(4)].map((_, index) => (
            <BannerCard key={index} cardWidth="100%" />
          ))
        )}
      </Stack>

      <BannerUpload
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        fetchBanners={fetchBanners}
        showSnackbar={showSnackbar}
      />

      <DeleteDialogBox
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedBanner(null);
        }}
        onDelete={handleDelete}
        loading={deleteLoading}
        title="Banner"
        name={selectedBanner?.title}
        warning="Are you sure you want to delete this banner? This action cannot be undone."
      />

      <BannerDialogBox
        isOpen={isPreviewDialogOpen}
        onClose={() => {
          setIsPreviewDialogOpen(false);
          setPreviewBannerURL(null);
        }}
        bannerURL={previewBannerURL}
      />
    </Stack>
  );
}
