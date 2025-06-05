"use client";
import {
  Avatar,
  Card,
  Typography,
  IconButton,
  Chip,
  Stack,
  Menu,
} from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import VerifiedIcon from "@mui/icons-material/Verified";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Image from "next/image";

const StudentCard = ({ user }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
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
  } = user;

  return (
    <Card
      sx={{
        display: "flex",
        alignItems: "center",
        padding: "15px",
        borderRadius: 3,
        width: "100%",
        maxWidth: "350px",
        cursor: "pointer",
        border: "1px solid var(--border-color)",
        transition: "all 0.3s ease",
        "&:hover": {
          borderColor:
            accountType === "FREE"
              ? "var(--primary-color)"
              : "var(--delete-color)",
        },
      }}
      onClick={() => {
        router.push(`/dashboard/students/${id}`);
      }}
      elevation={0}
    >
      {image ? (
        <Image
          src={image}
          alt={name}
          width={50}
          height={50}
          style={{ marginRight: 20, borderRadius: "50%" }}
        />
      ) : (
        <Avatar
          alt={name}
          sx={{ width: 50, height: 50, marginRight: 2 }}
          style={{ borderRadius: "50%" }}
        />
      )}
      <Stack gap="5px" sx={{ flexGrow: 1, padding: 0 }}>
        <Stack flexDirection="row" alignItems="center" gap={2}>
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "16px",
              fontWeight: "700",
            }}
          >
            {name ? name : "NO NAME"}
          </Typography>
        </Stack>
        <Typography sx={{ fontFamily: "Lato", fontSize: "12px" }}>
          {email?.length > 26 ? email?.slice(0, 25) + "..." : email}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(email);
            }}
            sx={{ ml: 1 }}
          >
            <FileCopyIcon sx={{ fontSize: "14px", color: "var(--text3)" }} />
          </IconButton>
        </Typography>
        <Stack flexDirection="row" alignItems="center" gap={2}>
          <Chip
            icon={
              emailVerified ? (
                <VerifiedIcon
                  sx={{ fontSize: "16px", fill: "var(--primary-color)" }}
                />
              ) : (
                <NewReleasesIcon
                  sx={{ fontSize: "16px", fill: "var(--sec-color)" }}
                />
              )
            }
            label={emailVerified ? "Verified" : "Unverified"}
            sx={{
              backgroundColor: emailVerified
                ? "var(--primary-color-acc-2)"
                : "var(--delete-color-acc-1)",
              color: emailVerified
                ? "var(--primary-color)"
                : "var(--sec-color)",
              fontWeight: "700",
              height: "26px",
              // width: "60px",
            }}
          />
          <Chip
            label={accountType}
            sx={{
              backgroundColor:
                accountType === "FREE"
                  ? "var(--primary-color-acc-2)"
                  : "var(--delete-color-acc-2)",
              color:
                accountType === "FREE"
                  ? "var(--primary-color)"
                  : "var(--delete-color)",
              fontWeight: "700",
              height: "26px",
              width: "60px",
            }}
          />
          <Chip
            label={status === "active" ? "Active" : "Blocked"}
            sx={{
              backgroundColor:
                status === "active"
                  ? "var(--primary-color-acc-2)"
                  : "var(--delete-color)",
              color: status === "active" ? "var(--primary-color)" : "white",
              fontWeight: "700",
              height: "26px",
            }}
          />
        </Stack>
      </Stack>
    </Card>
  );
};

export default StudentCard;
