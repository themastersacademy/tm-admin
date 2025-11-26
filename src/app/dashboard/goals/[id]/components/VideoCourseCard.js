"use client";
import { Circle, Edit, PlayCircle } from "@mui/icons-material";
import { Box, Button, Card, Stack, Typography } from "@mui/material";
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
        maxWidth: "280px",
        border: "1px solid var(--border-color)",
        borderRadius: "16px",
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.1)",
          borderColor: "var(--primary-color)",
          "& .play-icon": {
            opacity: 1,
            transform: "scale(1)",
          },
        },
      }}
    >
      {/* Thumbnail Section */}
      <Box sx={{ position: "relative", width: "100%", height: "160px" }}>
        <Image
          src={thumbnail}
          alt={title}
          fill
          style={{ objectFit: "cover" }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)",
          }}
        />
        <Box
          className="play-icon"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) scale(0.8)",
            opacity: 0,
            transition: "all 0.3s ease",
            color: "white",
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: "50%",
            display: "flex",
          }}
        >
          <PlayCircle sx={{ fontSize: "48px" }} />
        </Box>
        {language && (
          <Stack
            flexDirection="row"
            gap="4px"
            sx={{
              position: "absolute",
              bottom: "12px",
              left: "12px",
            }}
          >
            {(Array.isArray(language) ? language : [language]).map(
              (lang, index) => (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "10px",
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

      {/* Content Section */}
      <Stack padding="16px" gap="12px">
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--text1)",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            height: "44px",
          }}
        >
          {title}
        </Typography>

        <Stack
          flexDirection="row"
          alignItems="center"
          gap="8px"
          color="var(--text3)"
        >
          <Typography sx={{ fontFamily: "Lato", fontSize: "12px" }}>
            {lessons}
          </Typography>
          <Circle sx={{ fontSize: "4px" }} />
          <Typography sx={{ fontFamily: "Lato", fontSize: "12px" }}>
            {hours}
          </Typography>
        </Stack>

        <Button
          variant="outlined"
          startIcon={<Edit />}
          onClick={onEdit}
          fullWidth
          sx={{
            textTransform: "none",
            borderColor: "var(--border-color)",
            color: "var(--text2)",
            borderRadius: "8px",
            marginTop: "4px",
            "&:hover": {
              borderColor: "var(--primary-color)",
              color: "var(--primary-color)",
              backgroundColor: "var(--primary-color-acc-1)",
            },
          }}
        >
          Edit Course
        </Button>
      </Stack>
    </Card>
  );
}
