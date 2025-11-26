"use client";
import {
  Stack,
  Typography,
  Avatar,
  Button,
  Chip,
  IconButton,
  Skeleton,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Email,
  VerifiedUser,
  History,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import React from "react";

export default function StudentProfileHeader({
  student,
  onEditProfile,
  onSendEmail,
  onViewActivity,
  isLoading,
}) {
  const router = useRouter();

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

  return (
    <Stack
      sx={{
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Top Bar with Gradient */}
      <Stack
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "24px",
          position: "relative",
        }}
      >
        {/* Back Button */}
        <IconButton
          onClick={() => router.back()}
          sx={{
            position: "absolute",
            top: "20px",
            left: "20px",
            width: "40px",
            height: "40px",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.3)",
            },
          }}
        >
          <ArrowBack sx={{ color: "#fff", fontSize: "20px" }} />
        </IconButton>

        {/* Student Info Section */}
        <Stack
          direction="row"
          gap="24px"
          alignItems="flex-start"
          sx={{ mt: "40px" }}
        >
          {/* Avatar */}
          <Stack position="relative">
            {isLoading ? (
              <Skeleton variant="circular" width={100} height={100} />
            ) : (
              <>
                <Avatar
                  src={student?.image}
                  sx={{
                    width: 100,
                    height: 100,
                    border: "4px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                    fontSize: "40px",
                    fontWeight: 700,
                  }}
                >
                  {student?.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                {/* Online Status Indicator */}
                <Stack
                  sx={{
                    position: "absolute",
                    bottom: "4px",
                    right: "4px",
                    width: "20px",
                    height: "20px",
                    backgroundColor: "#4CAF50",
                    border: "3px solid #fff",
                    borderRadius: "50%",
                  }}
                />
              </>
            )}
          </Stack>

          {/* Student Details */}
          <Stack gap="8px" flex={1}>
            {isLoading ? (
              <>
                <Skeleton variant="text" width={200} height={32} />
                <Skeleton variant="text" width={250} height={24} />
              </>
            ) : (
              <>
                <Typography
                  sx={{
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "#fff",
                    fontFamily: "Lato",
                    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {student?.name || "Student Name"}
                </Typography>
                <Stack direction="row" alignItems="center" gap="10px">
                  <Typography
                    sx={{
                      fontSize: "15px",
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    {student?.email || "email@example.com"}
                  </Typography>
                  {student?.emailVerified && (
                    <VerifiedUser
                      sx={{
                        fontSize: "18px",
                        color: "#4CAF50",
                      }}
                    />
                  )}
                </Stack>

                {/* Quick Stats Chips */}
                <Stack direction="row" gap="10px" flexWrap="wrap" mt="12px">
                  <Chip
                    label={`ID: ${student?.id?.slice(0, 8) || "N/A"}`}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "11px",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                  />
                  <Chip
                    label={`Active Since: ${getAccountAge(student?.createdAt)}`}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "11px",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                  />
                  {student?.phoneNumber && (
                    <Chip
                      label={`📱 ${student.phoneNumber}`}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "11px",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                      }}
                    />
                  )}
                </Stack>
              </>
            )}
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" gap="12px">
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={onEditProfile}
              sx={{
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              Edit
            </Button>
            <IconButton
              onClick={onSendEmail}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              <Email sx={{ color: "#fff" }} />
            </IconButton>
            <IconButton
              onClick={onViewActivity}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              <History sx={{ color: "#fff" }} />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>

      {/* Status Bar */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        padding="16px 24px"
        sx={{
          backgroundColor: "var(--bg-color)",
          borderTop: "1px solid var(--border-color)",
        }}
      >
        <Stack direction="row" gap="16px" alignItems="center">
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text2)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Account Status
          </Typography>
          <Chip
            icon={
              student?.status === "active" ? (
                <CheckCircle sx={{ fontSize: "16px" }} />
              ) : (
                <Cancel sx={{ fontSize: "16px" }} />
              )
            }
            label={student?.status === "active" ? "Active" : "Inactive"}
            size="small"
            sx={{
              backgroundColor:
                student?.status === "active"
                  ? "rgba(76, 175, 80, 0.1)"
                  : "rgba(244, 67, 54, 0.1)",
              color: student?.status === "active" ? "#4CAF50" : "#F44336",
              fontWeight: 700,
              fontSize: "11px",
              border: `1px solid ${
                student?.status === "active" ? "#4CAF50" : "#F44336"
              }30`,
            }}
          />
        </Stack>

        <Stack direction="row" gap="8px" alignItems="center">
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text2)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Email Verified
          </Typography>
          <Chip
            icon={
              student?.emailVerified ? (
                <CheckCircle sx={{ fontSize: "16px" }} />
              ) : (
                <Cancel sx={{ fontSize: "16px" }} />
              )
            }
            label={student?.emailVerified ? "Verified" : "Not Verified"}
            size="small"
            sx={{
              backgroundColor: student?.emailVerified
                ? "rgba(33, 150, 243, 0.1)"
                : "rgba(255, 152, 0, 0.1)",
              color: student?.emailVerified ? "#2196F3" : "#FF9800",
              fontWeight: 700,
              fontSize: "11px",
              border: `1px solid ${
                student?.emailVerified ? "#2196F3" : "#FF9800"
              }30`,
            }}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
