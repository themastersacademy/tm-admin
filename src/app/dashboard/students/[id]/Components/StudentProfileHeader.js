"use client";
import {
  Stack,
  Typography,
  Button,
  Chip,
  IconButton,
  Skeleton,
  Dialog,
  DialogContent,
  DialogActions,
  Box,
} from "@mui/material";
import {
  ArrowBack,
  VerifiedUser,
  CheckCircle,
  Block,
  Delete,
  Person,
  Warning,
  ErrorOutline,
  Phone,
  CalendarToday,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { enqueueSnackbar } from "notistack";

export default function StudentProfileHeader({ student, isLoading }) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  const getAccountAge = (createdAt) => {
    if (!createdAt) return "New";
    const created = new Date(createdAt);
    const now = new Date();
    const months = Math.floor((now - created) / (1000 * 60 * 60 * 24 * 30));
    if (months < 1) return "New";
    if (months < 12) return `${months}mo`;
    return `${Math.floor(months / 12)}yr`;
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
          `User ${newStatus === "active" ? "unblocked" : "blocked"} successfully`,
          { variant: "success" }
        );
        window.location.reload();
      } else {
        enqueueSnackbar(response.error || "Failed to update status", { variant: "error" });
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
        { method: "DELETE" }
      );
      if (response.success) {
        enqueueSnackbar("User deleted successfully", { variant: "success" });
        router.push("/dashboard/students");
      } else {
        enqueueSnackbar(response.error || "Failed to delete user", { variant: "error" });
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
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          backgroundColor: "var(--white)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "16px 20px",
        }}
      >
        {/* Left */}
        <Stack direction="row" alignItems="center" gap="12px">
          <IconButton
            onClick={() => router.back()}
            sx={{
              width: 34,
              height: 34,
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "var(--primary-color)",
                borderColor: "var(--primary-color)",
                "& svg": { color: "#fff" },
              },
            }}
          >
            <ArrowBack sx={{ fontSize: "18px", color: "var(--text2)", transition: "color 0.2s" }} />
          </IconButton>

          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              backgroundColor: "var(--primary-color-acc-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(24, 113, 99, 0.15)",
              flexShrink: 0,
            }}
          >
            <Person sx={{ fontSize: "20px", color: "var(--primary-color)" }} />
          </Box>

          <Stack>
            <Stack direction="row" alignItems="center" gap="8px">
              {isLoading ? (
                <Skeleton variant="text" width={180} height={24} />
              ) : (
                <>
                  <Typography
                    sx={{
                      fontFamily: "Lato",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "var(--text1)",
                    }}
                  >
                    {student?.name || "Student"}
                  </Typography>
                  <Chip
                    label={student?.status === "active" ? "Active" : "Blocked"}
                    size="small"
                    sx={{
                      height: "20px",
                      fontSize: "10px",
                      fontWeight: 700,
                      backgroundColor: student?.status === "active" ? "rgba(76, 175, 80, 0.08)" : "rgba(244, 67, 54, 0.08)",
                      color: student?.status === "active" ? "#4caf50" : "#f44336",
                      border: `1px solid ${student?.status === "active" ? "#4caf5030" : "#f4433630"}`,
                    }}
                  />
                  {student?.emailVerified && (
                    <VerifiedUser sx={{ fontSize: "14px", color: "#4CAF50" }} />
                  )}
                </>
              )}
            </Stack>
            {isLoading ? (
              <Skeleton variant="text" width={220} height={16} />
            ) : (
              <Stack direction="row" alignItems="center" gap="12px">
                <Typography sx={{ fontSize: "12px", color: "var(--text4)" }}>
                  {student?.email}
                </Typography>
                {student?.phoneNumber && (
                  <Stack direction="row" alignItems="center" gap="3px">
                    <Phone sx={{ fontSize: "11px", color: "var(--text4)" }} />
                    <Typography sx={{ fontSize: "11px", color: "var(--text4)" }}>
                      {student.phoneNumber}
                    </Typography>
                  </Stack>
                )}
                <Stack direction="row" alignItems="center" gap="3px">
                  <CalendarToday sx={{ fontSize: "11px", color: "var(--text4)" }} />
                  <Typography sx={{ fontSize: "11px", color: "var(--text4)" }}>
                    {getAccountAge(student?.createdAt)}
                  </Typography>
                </Stack>
              </Stack>
            )}
          </Stack>
        </Stack>

        {/* Right */}
        <Stack direction="row" gap="8px">
          <Button
            variant="outlined"
            size="small"
            startIcon={
              student?.status === "active" ? (
                <Block sx={{ fontSize: "14px" }} />
              ) : (
                <CheckCircle sx={{ fontSize: "14px" }} />
              )
            }
            onClick={() => setIsBlockDialogOpen(true)}
            sx={{
              borderColor: "var(--border-color)",
              color: "var(--text2)",
              textTransform: "none",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              height: "34px",
              "&:hover": {
                borderColor: student?.status === "active" ? "#ff9800" : "#4caf50",
                backgroundColor: student?.status === "active" ? "rgba(255, 152, 0, 0.04)" : "rgba(76, 175, 80, 0.04)",
              },
            }}
          >
            {student?.status === "active" ? "Block" : "Unblock"}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Delete sx={{ fontSize: "14px" }} />}
            onClick={() => setIsDeleteDialogOpen(true)}
            sx={{
              borderColor: "#f4433640",
              color: "#f44336",
              textTransform: "none",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              height: "34px",
              "&:hover": {
                borderColor: "#f44336",
                backgroundColor: "rgba(244, 67, 54, 0.04)",
              },
            }}
          >
            Delete
          </Button>
        </Stack>
      </Stack>

      {/* Block Dialog */}
      <Dialog
        open={isBlockDialogOpen}
        onClose={() => !isBlocking && setIsBlockDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}
      >
        <DialogContent sx={{ padding: "24px" }}>
          <Stack alignItems="center" gap="16px">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                backgroundColor: student?.status === "active" ? "rgba(255, 152, 0, 0.1)" : "rgba(76, 175, 80, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {student?.status === "active" ? (
                <Warning sx={{ fontSize: "24px", color: "#FF9800" }} />
              ) : (
                <CheckCircle sx={{ fontSize: "24px", color: "#4CAF50" }} />
              )}
            </Box>
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "var(--text1)" }}>
              {student?.status === "active" ? "Block User?" : "Unblock User?"}
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "var(--text3)", textAlign: "center" }}>
              {student?.status === "active"
                ? `${student?.name} won't be able to log in or access their account.`
                : `${student?.name} will regain access to their account.`}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ padding: "0 24px 20px", gap: "8px" }}>
          <Button
            onClick={() => setIsBlockDialogOpen(false)}
            disabled={isBlocking}
            fullWidth
            sx={{ textTransform: "none", color: "var(--text2)", fontWeight: 600, height: "36px", borderRadius: "8px", border: "1px solid var(--border-color)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmBlock}
            disabled={isBlocking}
            variant="contained"
            fullWidth
            disableElevation
            sx={{
              textTransform: "none",
              backgroundColor: student?.status === "active" ? "#FF9800" : "#4CAF50",
              fontWeight: 700,
              height: "36px",
              borderRadius: "8px",
              "&:hover": { backgroundColor: student?.status === "active" ? "#F57C00" : "#388E3C" },
            }}
          >
            {isBlocking ? "Processing..." : student?.status === "active" ? "Block" : "Unblock"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => !isDeleting && setIsDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}
      >
        <DialogContent sx={{ padding: "24px" }}>
          <Stack alignItems="center" gap="16px">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                backgroundColor: "rgba(244, 67, 54, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ErrorOutline sx={{ fontSize: "24px", color: "#F44336" }} />
            </Box>
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "var(--text1)" }}>
              Delete User?
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "var(--text3)", textAlign: "center" }}>
              Permanently delete <strong>{student?.name}</strong> and all their data. This cannot be undone.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ padding: "0 24px 20px", gap: "8px" }}>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isDeleting}
            fullWidth
            sx={{ textTransform: "none", color: "var(--text2)", fontWeight: 600, height: "36px", borderRadius: "8px", border: "1px solid var(--border-color)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            variant="contained"
            fullWidth
            disableElevation
            sx={{
              textTransform: "none",
              backgroundColor: "#F44336",
              fontWeight: 700,
              height: "36px",
              borderRadius: "8px",
              "&:hover": { backgroundColor: "#D32F2F" },
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
