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
        maxWidth: "320px",
        border: "1px solid var(--border-color)",
        borderTop: `3px solid ${color}`,
        borderRadius: "10px",
        cursor: "pointer",
        transition: "all 0.15s ease",
        overflow: "hidden",
        "&:hover": {
          borderColor: color,
        },
      }}
    >
      <Stack padding="14px 16px" gap="12px">
        <Stack
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" alignItems="center" gap="10px">
            <Box
              sx={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: bgColor,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                border: `1px solid ${color}20`,
                flexShrink: 0,
              }}
            >
              <Image src={icon} alt={title} width={18} height={20} />
            </Box>
            <Typography
              sx={{
                fontFamily: "Lato",
                fontWeight: 700,
                fontSize: "14px",
                color: "var(--text1)",
              }}
            >
              {title}
            </Typography>
          </Stack>
          <ArrowForward
            sx={{ fontSize: "18px", color: "var(--text4)" }}
          />
        </Stack>

        <Typography
          sx={{
            fontSize: "12px",
            color: "var(--text4)",
            lineHeight: 1.5,
          }}
        >
          {description}
        </Typography>
      </Stack>
    </Card>
  );
}
