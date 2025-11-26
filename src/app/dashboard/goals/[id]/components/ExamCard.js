"use client";
import { ArrowForward } from "@mui/icons-material";
import { Box, Card, Stack, Typography } from "@mui/material";
import Image from "next/image";

export default function ExamCard({
  icon,
  title,
  description,
  onClick,
  color = "var(--primary-color)",
  bgColor = "var(--primary-color-acc-1)",
}) {
  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        width: "100%",
        maxWidth: "360px",
        padding: "24px",
        borderRadius: "16px",
        border: "1px solid var(--border-color)",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.1)",
          borderColor: color,
          "& .icon-box": {
            transform: "scale(1.1)",
            backgroundColor: color,
            color: "#fff",
          },
          "& .arrow-icon": {
            transform: "translateX(4px)",
            color: color,
          },
        },
      }}
    >
      <Stack gap="20px">
        <Stack
          flexDirection="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box
            className="icon-box"
            sx={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              backgroundColor: bgColor,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transition: "all 0.3s ease",
            }}
          >
            <Image src={icon} alt={title} width={32} height={32} />
          </Box>
          <Box
            className="arrow-icon"
            sx={{
              transition: "all 0.3s ease",
              color: "var(--text3)",
            }}
          >
            <ArrowForward />
          </Box>
        </Stack>

        <Stack gap="8px">
          <Typography
            variant="h6"
            sx={{
              fontFamily: "Lato",
              fontWeight: 700,
              fontSize: "18px",
              color: "var(--text1)",
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "14px",
              color: "var(--text3)",
              lineHeight: 1.6,
              minHeight: "44px", // Ensure consistent height
            }}
          >
            {description}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
