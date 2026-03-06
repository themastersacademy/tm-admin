"use client";
import {
  Avatar,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import {
  Person,
  VerifiedUser,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function StudentCard({ user, index = 0 }) {
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

  const isEven = index % 2 === 0;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
  };

  return (
    <Stack
      onClick={() => router.push(`/dashboard/students/${id}`)}
      direction="row"
      alignItems="center"
      sx={{
        width: "100%",
        backgroundColor: isEven ? "var(--white)" : "var(--bg-color, #fafafa)",
        borderRadius: "6px",
        padding: "7px 12px",
        cursor: "pointer",
        transition: "all 0.15s ease",
        gap: "12px",
        borderLeft: status === "active"
          ? "3px solid #4caf50"
          : "3px solid #f44336",
        "&:hover": {
          backgroundColor: "rgba(24, 113, 99, 0.04)",
        },
      }}
    >
      {/* # */}
      <Typography
        sx={{
          fontSize: "11px",
          fontWeight: 600,
          color: "var(--text4)",
          minWidth: "24px",
          textAlign: "center",
        }}
      >
        {index + 1}
      </Typography>

      {/* Avatar + Name */}
      <Stack direction="row" alignItems="center" gap="8px" sx={{ minWidth: "200px", flex: 1.2 }}>
        <Avatar
          src={image}
          sx={{
            width: 30,
            height: 30,
            borderRadius: "8px",
            backgroundColor: "var(--primary-color-acc-2)",
            color: "var(--primary-color)",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          {!image && (name?.charAt(0)?.toUpperCase() || <Person sx={{ fontSize: "16px" }} />)}
        </Avatar>
        <Stack sx={{ minWidth: 0 }}>
          <Typography
            title={name}
            sx={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text1)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "160px",
            }}
          >
            {name || "Unknown"}
          </Typography>
          <Typography
            sx={{
              fontSize: "10px",
              color: "var(--text4)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "160px",
            }}
          >
            {email}
          </Typography>
        </Stack>
      </Stack>

      {/* Phone */}
      <Typography
        sx={{
          fontSize: "11px",
          fontWeight: 500,
          color: "var(--text2)",
          minWidth: "100px",
          display: { xs: "none", md: "block" },
        }}
      >
        {phoneNumber || "-"}
      </Typography>

      {/* Gender */}
      <Typography
        sx={{
          fontSize: "11px",
          color: "var(--text3)",
          minWidth: "50px",
          textAlign: "center",
          display: { xs: "none", lg: "block" },
        }}
      >
        {gender || "-"}
      </Typography>

      {/* Joined */}
      <Typography
        sx={{
          fontSize: "10px",
          color: "var(--text4)",
          minWidth: "60px",
          textAlign: "center",
          display: { xs: "none", lg: "block" },
        }}
      >
        {formatDate(createdAt)}
      </Typography>

      {/* Status Badges */}
      <Stack direction="row" gap="4px" sx={{ minWidth: "140px", justifyContent: "flex-end" }}>
        <Chip
          label={status === "active" ? "Active" : "Blocked"}
          size="small"
          sx={{
            height: "20px",
            fontSize: "10px",
            fontWeight: 600,
            backgroundColor: status === "active" ? "rgba(76, 175, 80, 0.08)" : "rgba(244, 67, 54, 0.08)",
            color: status === "active" ? "#4caf50" : "#f44336",
            border: `1px solid ${status === "active" ? "#4caf5030" : "#f4433630"}`,
            "& .MuiChip-label": { padding: "0 6px" },
          }}
        />
        {emailVerified && (
          <Chip
            icon={<VerifiedUser sx={{ fontSize: "11px !important" }} />}
            label="Verified"
            size="small"
            sx={{
              height: "20px",
              fontSize: "10px",
              fontWeight: 600,
              backgroundColor: "rgba(33, 150, 243, 0.08)",
              color: "#2196F3",
              border: "1px solid #2196F330",
              "& .MuiChip-icon": { color: "#2196F3", ml: "4px" },
              "& .MuiChip-label": { padding: "0 6px" },
            }}
          />
        )}
        <Chip
          label={accountType || "FREE"}
          size="small"
          sx={{
            height: "20px",
            fontSize: "10px",
            fontWeight: 600,
            backgroundColor: accountType === "FREE" ? "rgba(33, 150, 243, 0.08)" : "rgba(156, 39, 176, 0.08)",
            color: accountType === "FREE" ? "#2196F3" : "#9C27B0",
            border: `1px solid ${accountType === "FREE" ? "#2196F3" : "#9C27B0"}30`,
            "& .MuiChip-label": { padding: "0 6px" },
          }}
        />
      </Stack>
    </Stack>
  );
}
