"use client";
import React from "react";
import { Stack, Typography, Button, Chip } from "@mui/material";
import { Folder } from "@mui/icons-material";

export default function CourseBankHeader({
  title,
  actions = [],
  totalCount = 0,
}) {
  return (
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
        {/* Left: Title & Badge */}
        <Stack direction="row" alignItems="center" gap="16px">
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
            <Folder sx={{ fontSize: "26px", color: "var(--primary-color)" }} />
          </Stack>

          <Stack gap="6px">
            <Stack direction="row" alignItems="center" gap="12px">
              <Typography
                sx={{
                  fontFamily: "Lato",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--text1)",
                }}
              >
                {title}
              </Typography>
              <Chip
                label={`${totalCount} ${
                  totalCount === 1 ? "Folder" : "Folders"
                }`}
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
            </Stack>
            <Typography
              sx={{ fontSize: "13px", color: "var(--text3)", lineHeight: 1.4 }}
            >
              Organize courses into folders for better management
            </Typography>
          </Stack>
        </Stack>

        {/* Right: Actions */}
        <Stack direction="row" gap="12px" alignItems="center">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "contained"}
              startIcon={action.icon}
              onClick={action.onClick}
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                padding: "10px 24px",
                fontWeight: 700,
                fontSize: "14px",
                minWidth: "140px",
                height: "48px",
                boxShadow:
                  action.variant === "contained"
                    ? "0 4px 12px rgba(255, 152, 0, 0.25)"
                    : "none",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow:
                    action.variant === "contained"
                      ? "0 6px 16px rgba(255, 152, 0, 0.35)"
                      : "none",
                },
                ...action.sx,
              }}
              disableElevation
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
