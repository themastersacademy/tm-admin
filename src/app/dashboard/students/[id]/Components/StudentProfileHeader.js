"use client";
import {
  Stack,
  Typography,
  Avatar,
  Button,
  Chip,
  IconButton,
  Skeleton,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ArrowBack,
  VerifiedUser,
  CheckCircle,
  Cancel,
  Block,
  Delete,
  Person,
  Warning,
  ErrorOutline,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { enqueueSnackbar } from "notistack";

export default function StudentProfileHeader({ student, isLoading }) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  // Calculate account age
  const getAccountAge = (createdAt) => {
    if (!createdAt) return "New";
    const created = new Date(createdAt);
    const now = new Date();
    const months = Math.floor((now - created) / (1000 * 60 * 60 * 24 * 30));
    if (months < 1) return "New";
    if (months < 12) return `${months}mo`;
    return `${Math.floor(months / 12)}yr`;
  };

  const handleBlock = () => {
    setIsBlockDialogOpen(true);
  };

  const confirmBlock = async () => {
    setIsBlocking(true);
    try {
      const newStatus = student.status === "active" ? "deactivated" : "active";
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/update-user-status`,
        {
          method: "POST",
          body: JSON.stringify({ id: student.id, status: newStatus }),
        }
      );
      if (response.success) {
        enqueueSnackbar(
          `User ${
            newStatus === "active" ? "unblocked" : "blocked"
          } successfully`,
          { variant: "success" }
        );
        window.location.reload();
      } else {
        enqueueSnackbar(response.error || "Failed to update status", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Failed to update status", { variant: "error" });
    } finally {
      setIsBlocking(false);
      setIsBlockDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${student.id}`,
        {
          method: "DELETE",
        }
      );
      if (response.success) {
        enqueueSnackbar("User deleted successfully", { variant: "success" });
        router.push("/dashboard/students");
      } else {
        enqueueSnackbar(response.error || "Failed to delete user", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Failed to delete user", { variant: "error" });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Stack
        sx={{
          backgroundColor: "var(--white)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {/* Top Bar */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          padding="20px 24px"
          sx={{
            borderBottom: "1px solid var(--border-color)",
            background: "linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)",
          }}
        >
          {/* Left: Back Button + Student Info */}
          <Stack direction="row" alignItems="center" gap="16px">
            <IconButton
              onClick={() => router.back()}
              sx={{
                width: "40px",
                height: "40px",
                border: "1.5px solid var(--border-color)",
                backgroundColor: "var(--white)",
                "&:hover": {
                  backgroundColor: "var(--bg-color)",
                  borderColor: "var(--primary-color)",
                },
              }}
            >
              <ArrowBack sx={{ fontSize: "20px", color: "var(--text2)" }} />
            </IconButton>

            <Stack
              sx={{
                width: "52px",
                height: "52px",
                background:
                  "linear-gradient(135deg, rgba(var(--primary-rgb), 0.12) 0%, rgba(var(--primary-rgb), 0.06) 100%)",
                borderRadius: "14px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                border: "1.5px solid rgba(var(--primary-rgb), 0.25)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <Person
                sx={{ fontSize: "26px", color: "var(--primary-color)" }}
              />
            </Stack>

            <Stack gap="6px">
              <Stack direction="row" alignItems="center" gap="12px">
                {isLoading ? (
                  <Skeleton variant="text" width={200} height={28} />
                ) : (
                  <>
                    <Typography
                      sx={{
                        fontFamily: "Lato",
                        fontSize: "22px",
                        fontWeight: 700,
                        color: "var(--text1)",
                      }}
                    >
                      {student?.name || "Student Name"}
                    </Typography>
                    <Chip
                      label={`ID: ${student?.id?.slice(0, 8) || "N/A"}`}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(255, 152, 0, 0.1)",
                        color: "#F57C00",
                        fontWeight: 700,
                        fontSize: "11px",
                        height: "24px",
                        border: "1px solid rgba(255, 152, 0, 0.2)",
                      }}
                    />
                  </>
                )}
              </Stack>
              {isLoading ? (
                <Skeleton variant="text" width={250} height={20} />
              ) : (
                <Stack direction="row" alignItems="center" gap="8px">
                  <Typography
                    sx={{
                      fontSize: "13px",
                      color: "var(--text3)",
                      lineHeight: 1.4,
                    }}
                  >
                    {student?.email || "email@example.com"}
                  </Typography>
                  {student?.emailVerified && (
                    <VerifiedUser
                      sx={{
                        fontSize: "16px",
                        color: "#4CAF50",
                      }}
                    />
                  )}
                </Stack>
              )}
            </Stack>
          </Stack>

          {/* Right: Action Buttons */}
          <Stack direction="row" gap="12px">
            <Button
              variant="outlined"
              startIcon={
                student?.status === "active" ? (
                  <Block sx={{ fontSize: "18px" }} />
                ) : (
                  <CheckCircle sx={{ fontSize: "18px" }} />
                )
              }
              onClick={handleBlock}
              sx={{
                border: "1.5px solid var(--border-color)",
                backgroundColor: "var(--white)",
                color: "var(--text1)",
                textTransform: "none",
                borderRadius: "10px",
                padding: "10px 20px",
                fontWeight: 600,
                fontSize: "14px",
                height: "48px",
                "&:hover": {
                  borderColor:
                    student?.status === "active" ? "#F57C00" : "#4CAF50",
                  backgroundColor:
                    student?.status === "active"
                      ? "rgba(255, 152, 0, 0.08)"
                      : "rgba(76, 175, 80, 0.08)",
                },
              }}
            >
              {student?.status === "active" ? "Block User" : "Unblock User"}
            </Button>
            <Button
              variant="contained"
              startIcon={<Delete sx={{ fontSize: "18px" }} />}
              onClick={() => setIsDeleteDialogOpen(true)}
              sx={{
                background: "linear-gradient(135deg, #F44336 0%, #D32F2F 100%)",
                color: "#FFFFFF",
                textTransform: "none",
                borderRadius: "10px",
                padding: "10px 20px",
                fontWeight: 700,
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(244, 67, 54, 0.25)",
                height: "48px",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #D32F2F 0%, #C62828 100%)",
                  boxShadow: "0 6px 16px rgba(244, 67, 54, 0.35)",
                  transform: "translateY(-1px)",
                },
              }}
              disableElevation
            >
              Delete User
            </Button>
          </Stack>
        </Stack>

        {/* Info Section */}
        <Stack padding="24px" gap="20px">
          <Stack direction="row" alignItems="center" gap="10px">
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--text1)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Student Information
            </Typography>
            <Stack
              sx={{
                width: "32px",
                height: "2px",
                background:
                  "linear-gradient(90deg, #FF9800 0%, transparent 100%)",
              }}
            />
          </Stack>

          {/* Info Cards */}
          <Stack direction="row" gap="16px" flexWrap="wrap">
            <InfoCard
              label="Account Status"
              value={student?.status === "active" ? "Active" : "Inactive"}
              icon={
                student?.status === "active" ? (
                  <CheckCircle sx={{ fontSize: "22px" }} />
                ) : (
                  <Cancel sx={{ fontSize: "22px" }} />
                )
              }
              color={student?.status === "active" ? "#4CAF50" : "#F44336"}
              bgColor={
                student?.status === "active"
                  ? "rgba(76, 175, 80, 0.08)"
                  : "rgba(244, 67, 54, 0.08)"
              }
              isLoading={isLoading}
            />
            <InfoCard
              label="Email Status"
              value={student?.emailVerified ? "Verified" : "Not Verified"}
              icon={
                student?.emailVerified ? (
                  <VerifiedUser sx={{ fontSize: "22px" }} />
                ) : (
                  <Cancel sx={{ fontSize: "22px" }} />
                )
              }
              color={student?.emailVerified ? "#2196F3" : "#FF9800"}
              bgColor={
                student?.emailVerified
                  ? "rgba(33, 150, 243, 0.08)"
                  : "rgba(255, 152, 0, 0.08)"
              }
              isLoading={isLoading}
            />
            <InfoCard
              label="Member Since"
              value={getAccountAge(student?.createdAt)}
              icon={<Person sx={{ fontSize: "22px" }} />}
              color="#9C27B0"
              bgColor="rgba(156, 39, 176, 0.08)"
              isLoading={isLoading}
            />
            {student?.phoneNumber && (
              <InfoCard
                label="Phone Number"
                value={student.phoneNumber}
                icon={<span style={{ fontSize: "22px" }}>📱</span>}
                color="#607D8B"
                bgColor="rgba(96, 125, 139, 0.08)"
                isLoading={isLoading}
              />
            )}
          </Stack>
        </Stack>
      </Stack>

      {/* Block Confirmation Dialog */}
      <Dialog
        open={isBlockDialogOpen}
        onClose={() => !isBlocking && setIsBlockDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: "8px",
            maxWidth: "420px",
            width: "100%",
          },
        }}
      >
        <DialogContent sx={{ padding: "32px 24px 24px" }}>
          <Stack alignItems="center" gap="20px">
            <Stack
              sx={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor:
                  student?.status === "active"
                    ? "rgba(255, 152, 0, 0.1)"
                    : "rgba(76, 175, 80, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {student?.status === "active" ? (
                <Warning sx={{ fontSize: "32px", color: "#FF9800" }} />
              ) : (
                <CheckCircle sx={{ fontSize: "32px", color: "#4CAF50" }} />
              )}
            </Stack>

            <Stack alignItems="center" gap="8px">
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--text1)",
                  fontFamily: "Lato",
                }}
              >
                {student?.status === "active" ? "Block User?" : "Unblock User?"}
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
                  color: "var(--text3)",
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                {student?.status === "active"
                  ? `Are you sure you want to block ${student?.name}? They won't be able to log in or access their account.`
                  : `Are you sure you want to unblock ${student?.name}? They will regain access to their account.`}
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ padding: "0 24px 24px", gap: "12px" }}>
          <Button
            onClick={() => setIsBlockDialogOpen(false)}
            disabled={isBlocking}
            variant="outlined"
            fullWidth
            sx={{
              textTransform: "none",
              borderColor: "var(--border-color)",
              color: "var(--text2)",
              fontWeight: 600,
              height: "44px",
              "&:hover": {
                borderColor: "var(--text2)",
                backgroundColor: "var(--bg-color)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmBlock}
            disabled={isBlocking}
            variant="contained"
            fullWidth
            sx={{
              textTransform: "none",
              background:
                student?.status === "active"
                  ? "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)"
                  : "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
              color: "#fff",
              fontWeight: 700,
              height: "44px",
              boxShadow:
                student?.status === "active"
                  ? "0 4px 12px rgba(255, 152, 0, 0.25)"
                  : "0 4px 12px rgba(76, 175, 80, 0.25)",
              "&:hover": {
                background:
                  student?.status === "active"
                    ? "linear-gradient(135deg, #F57C00 0%, #E65100 100%)"
                    : "linear-gradient(135deg, #388E3C 0%, #2E7D32 100%)",
              },
            }}
            disableElevation
          >
            {isBlocking
              ? student?.status === "active"
                ? "Blocking..."
                : "Unblocking..."
              : student?.status === "active"
              ? "Block User"
              : "Unblock User"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => !isDeleting && setIsDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: "8px",
            maxWidth: "420px",
            width: "100%",
          },
        }}
      >
        <DialogContent sx={{ padding: "32px 24px 24px" }}>
          <Stack alignItems="center" gap="20px">
            <Stack
              sx={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "rgba(244, 67, 54, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ErrorOutline sx={{ fontSize: "32px", color: "#F44336" }} />
            </Stack>

            <Stack alignments="center" gap="8px">
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--text1)",
                  fontFamily: "Lato",
                  textAlign: "center",
                }}
              >
                Delete User?
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
                  color: "var(--text3)",
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                Are you sure you want to permanently delete{" "}
                <strong>{student?.name}</strong>?
              </Typography>
              <Typography
                sx={{
                  fontSize: "13px",
                  color: "#F44336",
                  textAlign: "center",
                  fontWeight: 600,
                  marginTop: "8px",
                }}
              >
                ⚠️ This action cannot be undone!
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ padding: "0 24px 24px", gap: "12px" }}>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isDeleting}
            variant="outlined"
            fullWidth
            sx={{
              textTransform: "none",
              borderColor: "var(--border-color)",
              color: "var(--text2)",
              fontWeight: 600,
              height: "44px",
              "&:hover": {
                borderColor: "var(--text2)",
                backgroundColor: "var(--bg-color)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            variant="contained"
            fullWidth
            sx={{
              textTransform: "none",
              background: "linear-gradient(135deg, #F44336 0%, #D32F2F 100%)",
              color: "#fff",
              fontWeight: 700,
              height: "44px",
              boxShadow: "0 4px 12px rgba(244, 67, 54, 0.25)",
              "&:hover": {
                background: "linear-gradient(135deg, #D32F2F 0%, #C62828 100%)",
              },
            }}
            disableElevation
          >
            {isDeleting ? "Deleting..." : "Delete User"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

const InfoCard = ({ label, value, icon, color, bgColor, isLoading }) => (
  <Stack
    direction="row"
    alignItems="center"
    gap="12px"
    padding="16px 20px"
    sx={{
      backgroundColor: bgColor || "var(--bg-color)",
      borderRadius: "12px",
      border: "1px solid var(--border-color)",
      minWidth: "220px",
      flex: 1,
    }}
  >
    <Stack
      sx={{
        width: "44px",
        height: "44px",
        backgroundColor: "var(--white)",
        borderRadius: "10px",
        justifyContent: "center",
        alignItems: "center",
        border: `1.5px solid ${color}30`,
        flexShrink: 0,
      }}
    >
      {icon &&
        React.cloneElement(icon, {
          sx: { fontSize: "22px", color: color },
        })}
    </Stack>
    <Stack gap="4px" flex={1}>
      <Typography
        sx={{
          fontSize: "12px",
          color: "var(--text3)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </Typography>
      {isLoading ? (
        <Typography sx={{ fontSize: "18px", color: "var(--text3)" }}>
          -
        </Typography>
      ) : (
        <Typography
          sx={{
            fontSize: "18px",
            fontWeight: 700,
            color: color,
            fontFamily: "Lato",
            lineHeight: 1,
          }}
        >
          {value}
        </Typography>
      )}
    </Stack>
  </Stack>
);
