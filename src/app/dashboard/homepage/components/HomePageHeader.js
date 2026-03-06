"use client";
import { Stack, Typography } from "@mui/material";
import { Home } from "@mui/icons-material";

export default function HomePageHeader() {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap="10px"
      padding="10px 16px"
      sx={{
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
      }}
    >
      <Stack
        sx={{
          width: "32px",
          height: "32px",
          backgroundColor: "rgba(24, 113, 99, 0.08)",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Home sx={{ fontSize: "18px", color: "var(--primary-color)" }} />
      </Stack>

      <Typography
        sx={{
          fontFamily: "Lato",
          fontSize: "15px",
          fontWeight: 700,
          color: "var(--text1)",
        }}
      >
        Home Page Settings
      </Typography>
    </Stack>
  );
}
