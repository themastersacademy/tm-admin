"use client";
import { Circle, East } from "@mui/icons-material";
import { Box, Card, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import Image from "next/image";

export default function VideoCourseCard({
  title,
  thumbnail,
  language,
  lessons,
  hours,
  onEdit,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: "240px",
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        overflow: "hidden",
        transition: "all 0.15s ease",
        cursor: "pointer",
        "&:hover": {
          borderColor: "var(--primary-color)",
          "& .edit-btn": { opacity: 1 },
        },
      }}
      onClick={onEdit}
    >
      {/* Thumbnail */}
      <Box sx={{ position: "relative", width: "100%", height: "120px" }}>
        <Image
          src={thumbnail}
          alt={title}
          fill
          style={{ objectFit: "cover" }}
        />
        {language && (
          <Stack
            flexDirection="row"
            gap="3px"
            sx={{
              position: "absolute",
              top: "6px",
              left: "6px",
            }}
          >
            {(Array.isArray(language) ? language : [language]).map(
              (lang, index) => (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.92)",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    fontSize: "9px",
                    fontWeight: 700,
                    color: "var(--text1)",
                    fontFamily: "Lato",
                  }}
                >
                  {lang}
                </Box>
              )
            )}
          </Stack>
        )}
      </Box>

      {/* Content */}
      <Stack padding="10px 12px" gap="6px">
        <Stack direction="row" alignItems="flex-start" gap="6px">
          <Typography
            sx={{
              flex: 1,
              fontFamily: "Lato",
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--text1)",
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "34px",
            }}
          >
            {title}
          </Typography>
          <Tooltip title="Edit Course">
            <IconButton
              className="edit-btn"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              sx={{
                width: 24,
                height: 24,
                opacity: 0,
                transition: "opacity 0.15s",
                flexShrink: 0,
                marginTop: "1px",
                color: "var(--text4)",
                "&:hover": {
                  color: "var(--primary-color)",
                  backgroundColor: "rgba(24, 113, 99, 0.06)",
                },
              }}
            >
              <East sx={{ fontSize: "13px" }} />
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack
          flexDirection="row"
          alignItems="center"
          gap="6px"
          color="var(--text4)"
        >
          <Typography sx={{ fontFamily: "Lato", fontSize: "11px" }}>
            {lessons}
          </Typography>
          <Circle sx={{ fontSize: "3px" }} />
          <Typography sx={{ fontFamily: "Lato", fontSize: "11px" }}>
            {hours}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
