"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Stack,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  CircularProgress,
  Switch,
  Box,
  Tooltip,
} from "@mui/material";
import { Add, Edit, Delete, Refresh } from "@mui/icons-material";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import AnnouncementDialog from "./AnnouncementDialog";
import DeleteDialogBox from "@/src/components/DeleteDialogBox/DeleteDialogBox";

export default function AnnouncementsManagement() {
  const { showSnackbar } = useSnackbar();
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch("/api/homepage/announcements");
      if (data.success) {
        setAnnouncements(data.data);
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      showSnackbar("Error loading announcements", "error", "", "3000");
    } finally {
      setIsLoading(false);
    }
  }, [showSnackbar]);

  const handleEdit = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedAnnouncement) return;
    setDeleteLoading(true);

    try {
      const data = await apiFetch("/api/homepage/announcements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          announcementID: selectedAnnouncement.announcementID,
        }),
      });

      if (data.success) {
        showSnackbar(
          "Announcement deleted successfully",
          "success",
          "",
          "3000"
        );
        fetchAnnouncements();
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      showSnackbar("Error deleting announcement", "error", "", "3000");
    } finally {
      setDeleteLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedAnnouncement(null);
    }
  };

  const handleToggleActive = async (announcement) => {
    try {
      const data = await apiFetch("/api/homepage/announcements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          announcementID: announcement.announcementID,
          title: announcement.title,
          message: announcement.message,
          type: announcement.type,
          isActive: !announcement.isActive,
        }),
      });

      if (data.success) {
        showSnackbar("Announcement updated", "success", "", "2000");
        fetchAnnouncements();
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
    } catch (error) {
      console.error("Error updating announcement:", error);
      showSnackbar("Error updating announcement", "error", "", "3000");
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const getTypeBorderColor = (type) => {
    switch (type) {
      case "success":
        return "#4CAF50";
      case "warning":
        return "#FF9800";
      case "error":
        return "#F44336";
      default:
        return "#2196F3";
    }
  };

  const getTypeChipStyle = (type) => {
    switch (type) {
      case "success":
        return {
          backgroundColor: "rgba(76, 175, 80, 0.12)",
          color: "#4CAF50",
          border: "1px solid rgba(76, 175, 80, 0.3)",
        };
      case "warning":
        return {
          backgroundColor: "rgba(255, 152, 0, 0.12)",
          color: "#FF9800",
          border: "1px solid rgba(255, 152, 0, 0.3)",
        };
      case "error":
        return {
          backgroundColor: "rgba(244, 67, 54, 0.12)",
          color: "#F44336",
          border: "1px solid rgba(244, 67, 54, 0.3)",
        };
      default:
        return {
          backgroundColor: "rgba(33, 150, 243, 0.12)",
          color: "#2196F3",
          border: "1px solid rgba(33, 150, 243, 0.3)",
        };
    }
  };

  const activeCount = announcements.filter((a) => a.isActive).length;

  if (isLoading) {
    return (
      <Stack alignItems="center" padding="40px">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack gap="24px">
      {/* Header Section */}
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
              Announcements
            </Typography>
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
                {activeCount} Active
              </Typography>
            </Stack>
          </Stack>
          <Typography sx={{ fontSize: "13px", color: "var(--text3)" }}>
            Create and manage announcements for the user app
          </Typography>
        </Stack>

        <Stack direction="row" gap="12px">
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAnnouncements}
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              padding: "10px 20px",
              fontWeight: 600,
              fontSize: "14px",
              borderColor: "var(--border-color)",
              color: "var(--text2)",
              height: "48px",
              "&:hover": {
                borderColor: "#FF9800",
                backgroundColor: "rgba(255, 152, 0, 0.04)",
              },
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedAnnouncement(null);
              setIsDialogOpen(true);
            }}
            sx={{
              background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
              color: "#FFFFFF",
              textTransform: "none",
              borderRadius: "10px",
              padding: "10px 24px",
              fontWeight: 700,
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(255, 152, 0, 0.25)",
              minWidth: "180px",
              height: "48px",
              "&:hover": {
                background: "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
                boxShadow: "0 6px 16px rgba(255, 152, 0, 0.35)",
                transform: "translateY(-1px)",
              },
            }}
            disableElevation
          >
            Add Announcement
          </Button>
        </Stack>
      </Stack>

      {/* Announcements Grid */}
      {announcements.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: "16px",
          }}
        >
          {announcements.map((announcement) => (
            <Card
              key={announcement.announcementID}
              sx={{
                width: "100%",
                border: "1px solid var(--border-color)",
                borderRadius: "12px",
                borderLeft: `4px solid ${getTypeBorderColor(
                  announcement.type
                )}`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                backgroundColor: "var(--white)",
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  transform: "translateY(-4px)",
                },
              }}
              elevation={0}
            >
              <CardContent
                sx={{
                  padding: "16px",
                  "&:last-child": { paddingBottom: "16px" },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "160px",
                }}
              >
                <Stack gap="12px">
                  {/* Top Row: Title + Type (Left), Active Switch (Right - Absolute) */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    gap="8px"
                    sx={{ paddingRight: "40px" }} // Space for switch
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "14px",
                        color: "var(--text1)",
                        letterSpacing: "0.2px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {announcement.title}
                    </Typography>
                    <Chip
                      label={announcement.type.toUpperCase()}
                      size="small"
                      sx={{
                        fontSize: "9px",
                        fontWeight: 700,
                        height: "18px",
                        borderRadius: "4px",
                        ...getTypeChipStyle(announcement.type),
                      }}
                    />
                  </Stack>

                  {/* Message Body */}
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "var(--text3)",
                      lineHeight: 1.6,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      marginBottom: "32px", // Space for actions
                    }}
                  >
                    {announcement.message}
                  </Typography>
                </Stack>

                {/* Absolute Positioned Controls */}

                {/* Active Switch - Top Right */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                  }}
                >
                  <Tooltip
                    title={announcement.isActive ? "Active" : "Inactive"}
                  >
                    <Switch
                      checked={announcement.isActive}
                      onChange={() => handleToggleActive(announcement)}
                      size="small"
                      sx={{
                        padding: 0,
                        width: 28,
                        height: 16,
                        "& .MuiSwitch-thumb": {
                          width: 12,
                          height: 12,
                        },
                        "& .MuiSwitch-switchBase": {
                          padding: "2px",
                          "&.Mui-checked": {
                            transform: "translateX(12px)",
                            color: "#fff",
                            "& + .MuiSwitch-track": {
                              opacity: 1,
                              backgroundColor: "#4CAF50",
                            },
                          },
                        },
                      }}
                    />
                  </Tooltip>
                </Box>

                {/* Action Buttons - Bottom Right */}
                <Stack
                  direction="row"
                  gap="4px"
                  sx={{
                    position: "absolute",
                    bottom: "12px",
                    right: "12px",
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(announcement)}
                    sx={{
                      padding: "6px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "var(--white)",
                      "&:hover": {
                        backgroundColor: "rgba(255, 152, 0, 0.08)",
                        borderColor: "#FF9800",
                        color: "#FF9800",
                      },
                    }}
                  >
                    <Edit sx={{ fontSize: "16px" }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedAnnouncement(announcement);
                      setIsDeleteDialogOpen(true);
                    }}
                    sx={{
                      padding: "6px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "var(--white)",
                      "&:hover": {
                        backgroundColor: "#FFEBEE",
                        borderColor: "#FF5252",
                        color: "#D32F2F",
                      },
                    }}
                  >
                    <Delete sx={{ fontSize: "16px" }} />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Stack sx={{ minHeight: "300px" }}>
          <NoDataFound info="No announcements created yet" />
        </Stack>
      )}

      <AnnouncementDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedAnnouncement(null);
        }}
        announcement={selectedAnnouncement}
        onSuccess={fetchAnnouncements}
      />

      <DeleteDialogBox
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedAnnouncement(null);
        }}
        onDelete={handleDelete}
        loading={deleteLoading}
        title="Announcement"
        name={selectedAnnouncement?.title}
        warning="Are you sure you want to delete this announcement? This action cannot be undone."
      />
    </Stack>
  );
}
