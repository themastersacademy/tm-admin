"use client";
import { Stack, Typography } from "@mui/material";
import { Home } from "@mui/icons-material";

export default function HomePageHeader() {
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
          background: "linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)",
        }}
      >
        {/* Left: Title & Icon */}
        <Stack direction="row" alignItems="center" gap="16px">
          <Stack
            sx={{
              width: "52px",
              height: "52px",
              background:
                "linear-gradient(135deg, rgba(255, 152, 0, 0.12) 0%, rgba(245, 124, 0, 0.06) 100%)",
              borderRadius: "14px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: `1.5px solid rgba(255, 152, 0, 0.25)`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <Home sx={{ fontSize: "26px", color: "#FF9800" }} />
          </Stack>

          <Stack gap="6px">
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--text1)",
              }}
            >
              Home Page Settings
            </Typography>
            <Typography
              sx={{ fontSize: "13px", color: "var(--text3)", lineHeight: 1.4 }}
            >
              Manage content displayed on the user app home page
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
