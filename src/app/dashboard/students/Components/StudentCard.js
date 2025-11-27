"use client";
import {
  Avatar,
  Stack,
  Typography,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Phone,
  Person,
  CalendarToday,
  ArrowForward,
  CheckCircle,
  Cancel,
  VerifiedUser,
  ContentCopy,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import React from "react";

export default function StudentCard({ user }) {
  const router = useRouter();
  const {
    name,
    email,
    emailVerified,
    phoneNumber,
    image,
    accountType,
    gender,
    status,
    id,
    createdAt,
  } = user;

  const handleCopyEmail = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Stack
      onClick={() => router.push(`/dashboard/students/${id}`)}
      sx={{
        backgroundColor: "var(--white)",
        borderRadius: "16px",
        border: "1px solid var(--border-color)",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        width: "100%",
        maxWidth: "350px",
        flex: "1 1 300px",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px -4px rgba(0, 0, 0, 0.12)",
          borderColor: "var(--primary-color)",
          "& .action-btn": {
            opacity: 1,
            transform: "translateX(0)",
          },
        },
      }}
    >
      {/* Top Gradient Line */}
      <Stack
        sx={{
          height: "6px",
          background:
            status === "active"
              ? "linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%)"
              : "linear-gradient(90deg, #F44336 0%, #FF9800 100%)",
        }}
      />

      <Stack padding="20px" gap="20px">
        {/* Header: Avatar & Basic Info */}
        <Stack direction="row" gap="16px" alignItems="center">
          <Avatar
            src={image}
            sx={{
              width: 56,
              height: 56,
              border: "2px solid var(--white)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              fontSize: "24px",
              fontWeight: 700,
              bgcolor: "var(--primary-color)",
            }}
          >
            {name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Stack overflow="hidden">
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--text1)",
                fontFamily: "Lato",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {name || "Unknown Student"}
            </Typography>
            <Stack direction="row" alignItems="center" gap="4px">
              <Typography
                sx={{
                  fontSize: "13px",
                  color: "var(--text3)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "160px",
                }}
              >
                {email}
              </Typography>
              <Tooltip title="Copy Email">
                <IconButton
                  size="small"
                  onClick={handleCopyEmail}
                  sx={{ padding: "2px" }}
                >
                  <ContentCopy
                    sx={{ fontSize: "12px", color: "var(--text4)" }}
                  />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>

        {/* Info Grid */}
        <Stack
          direction="row"
          flexWrap="wrap"
          gap="12px"
          sx={{
            padding: "12px",
            backgroundColor: "var(--bg-color)",
            borderRadius: "12px",
          }}
        >
          <InfoItem
            icon={<Phone sx={{ fontSize: "14px" }} />}
            label={phoneNumber || "N/A"}
          />
          <InfoItem
            icon={<Person sx={{ fontSize: "14px" }} />}
            label={gender || "N/A"}
          />
          <InfoItem
            icon={<CalendarToday sx={{ fontSize: "14px" }} />}
            label={formatDate(createdAt)}
          />
        </Stack>

        {/* Footer: Badges & Action */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" gap="8px">
            <Chip
              label={status === "active" ? "Active" : "Blocked"}
              size="small"
              icon={
                status === "active" ? (
                  <CheckCircle sx={{ fontSize: "14px !important" }} />
                ) : (
                  <Cancel sx={{ fontSize: "14px !important" }} />
                )
              }
              sx={{
                height: "24px",
                fontSize: "11px",
                fontWeight: 700,
                backgroundColor:
                  status === "active"
                    ? "rgba(76, 175, 80, 0.1)"
                    : "rgba(244, 67, 54, 0.1)",
                color: status === "active" ? "#4CAF50" : "#F44336",
                "& .MuiChip-icon": {
                  color: "inherit",
                },
              }}
            />
            {emailVerified && (
              <Chip
                label="Verified"
                size="small"
                icon={<VerifiedUser sx={{ fontSize: "14px !important" }} />}
                sx={{
                  height: "24px",
                  fontSize: "11px",
                  fontWeight: 700,
                  backgroundColor: "rgba(33, 150, 243, 0.1)",
                  color: "#2196F3",
                  "& .MuiChip-icon": {
                    color: "inherit",
                  },
                }}
              />
            )}
            <Chip
              label={accountType || "FREE"}
              size="small"
              sx={{
                height: "24px",
                fontSize: "11px",
                fontWeight: 700,
                backgroundColor:
                  accountType === "FREE"
                    ? "rgba(33, 150, 243, 0.1)"
                    : "rgba(156, 39, 176, 0.1)",
                color: accountType === "FREE" ? "#2196F3" : "#9C27B0",
                border: `1px solid ${
                  accountType === "FREE" ? "#2196F3" : "#9C27B0"
                }30`,
              }}
            />
          </Stack>

          <IconButton
            className="action-btn"
            sx={{
              backgroundColor: "var(--primary-color)",
              color: "#fff",
              width: "32px",
              height: "32px",
              opacity: 0,
              transform: "translateX(-10px)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                backgroundColor: "var(--primary-color-dark)",
              },
            }}
          >
            <ArrowForward sx={{ fontSize: "18px" }} />
          </IconButton>
        </Stack>
      </Stack>
    </Stack>
  );
}

const InfoItem = ({ icon, label }) => (
  <Stack direction="row" alignItems="center" gap="6px" minWidth="45%">
    <Stack
      sx={{
        color: "var(--text3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </Stack>
    <Typography
      sx={{
        fontSize: "12px",
        color: "var(--text2)",
        fontWeight: 500,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {label}
    </Typography>
  </Stack>
);
