"use client";
import { Delete } from "@mui/icons-material";
import { Card, IconButton, Stack, Typography } from "@mui/material";

export default function BannerCard({
  icon,
  title,
  subTitle,
  cardWidth,
  onClick,
  onDelete,
  button,
  isLive,
  live,
  sx,
}) {
  return (
    <Card
      sx={{
        width: cardWidth,
        position: "relative",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        padding: "8px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: onClick ? "pointer" : "default",
        backgroundColor: "var(--white)",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(255, 152, 0, 0.12)",
          transform: onClick ? "translateY(-4px)" : "none",
          borderColor: "rgba(255, 152, 0, 0.4)",
        },
        ...sx,
      }}
      elevation={0}
      onClick={onClick}
    >
      {/* Delete Button */}
      {onDelete && (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          sx={{
            position: "absolute",
            top: "8px",
            right: "8px",
            zIndex: 10,
            padding: "6px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "#FFEBEE",
              borderColor: "#FF5252",
              color: "#D32F2F",
            },
          }}
          size="small"
        >
          <Delete sx={{ fontSize: "18px", color: "var(--text3)" }} />
        </IconButton>
      )}

      <Stack direction="column" gap="12px">
        {/* Banner Image Container - 2:1 Aspect Ratio */}
        <Stack
          sx={{
            width: "100%",
            aspectRatio: "2/1",
            backgroundColor: "#F8F9FA",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            border: "1px solid var(--border-color)",
            position: "relative",
          }}
        >
          {icon}
        </Stack>

        {/* Content */}
        <Stack gap="4px" padding="0 4px 4px 4px">
          <Typography
            component="div"
            sx={{
              color: "var(--text1)",
              fontFamily: "Lato",
              fontSize: "14px",
              fontWeight: 700,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              letterSpacing: "0.2px",
            }}
          >
            {title}
          </Typography>
          {subTitle && (
            <Typography
              component="div"
              sx={{
                color: "var(--text3)",
                fontFamily: "Lato",
                fontSize: "12px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {subTitle}
            </Typography>
          )}

          {/* Status/Actions Row */}
          <Stack direction="row" alignItems="center" gap="8px" mt="4px">
            {live}
            {isLive}
            {button}
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}
