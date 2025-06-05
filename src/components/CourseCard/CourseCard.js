"use client";
import { Circle } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import Image from "next/image";

export default function CourseCard({
  title,
  thumbnail,
  Language,
  lessons,
  hours,
  actionButton,
  progress,
}) {
  return (
    <Card
      sx={{
        width: "200px",
        minHeight: "250px",
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "row",
      }}
      elevation={0}
    >
      <Stack
        sx={{
          height: "100%",
        }}
      >
        <Box position="relative">
          <Image
            src={thumbnail}
            alt="videoThumbnail"
            width={200}
            height={137}
            style={{ objectFit: "cover" }}
            priority
          />
          {progress && (
            <CircularProgress
              variant="determinate"
              value={75}
              size={20}
              sx={{
                color: "var(--sec-color)",
                position: "absolute",
                top: "8px",
                left: "150px",
              }}
            />
          )}
        </Box>
        <Stack sx={{ padding: "10px", gap: "8px", height: "100%" }}>
          <Typography
            sx={{ fontFamily: "Lato", fontSize: "14px", fontWeight: "700" }}
          >
            {title}
          </Typography>
          <Stack flexDirection="row" gap="2px" flexWrap="wrap">
            {Array.isArray(Language) &&
              Language.map((item, index) => (
                <Button
                  key={index}
                  variant="contained"
                  disableElevation
                  sx={{
                    backgroundColor: "var(--sec-color-acc-1)",
                    color: "var(--sec-color)",
                    width: "50px",
                    fontSize: "10px",
                    fontFamily: "Lato",
                    textTransform: "none",
                    height: "20px",
                  }}
                >
                  {item}
                </Button>
              ))}
          </Stack>
          <Stack flexDirection="row" alignItems="center" gap="10px">
            <Typography sx={{ fontFamily: "Lato", fontSize: "12px" }}>
              {lessons}
            </Typography>
            <Circle sx={{ fontSize: "10px", color: "var(--border-color)" }} />
            <Typography sx={{ fontFamily: "Lato", fontSize: "12px" }}>
              {hours}
            </Typography>
          </Stack>
          <Stack alignItems="center" sx={{ marginTop: "auto", height: "100%" }}>
            {actionButton}
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}
