"use client";
import { Avatar, Button, Chip, Stack, Typography } from "@mui/material";

export default function StudentProgressCard({
  name,
  email,
  image,
  year,
  college,
  time,
  status,
  percent,
  examName,
  marks,
}) {
  return (
    <Stack
      flexDirection="row"
      padding="10px"
      alignItems="center"
      gap="10px"
      width="100%"
      sx={{
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        minHeight: "80px",
      }}
    >
      <Stack flexDirection="row" alignItems="center" gap="30px">
        <Avatar
          src={image}
          sx={{
            width: "50px",
            height: "50px",
            borderRadius: "10px",
            color: "var(--sec-color)",
            backgroundColor: "var(--sec-color-acc-1)",
          }}
        />
        <Stack gap="5px" width="100%">
          <Typography
            sx={{ fontFamily: "Lato", fontSize: "14px", fontWeight: "700" }}
            width="250px"
          >
            {name}
          </Typography>
          <Typography sx={{ fontFamily: "Lato", fontSize: "14px" }}>
            {email}
          </Typography>
        </Stack>
      </Stack>
      <Stack flexDirection="row" gap={8} alignItems="center" width="100%">
        <Stack gap="5px">
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "14px",
              fontWeight: "700",
              color: "var(--text1)",
            }}
          >
            {college}
          </Typography>
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "14px",
              fontWeight: "400",
              color: "var(--text1)",
            }}
          >
            {year}
          </Typography>
        </Stack>
        <Stack gap="5px">
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "14px",
              fontWeight: "400",
            }}
          >
            {examName}
          </Typography>
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "14px",
              fontWeight: "400",
              color: "var(--text4)",
            }}
          >
            {time}
          </Typography>
        </Stack>
        <Stack flexDirection="row" gap="10px">
          <Typography>{percent}</Typography>
          <Typography>{marks} Marks</Typography>
        </Stack>
      </Stack>
      <Chip
        label={status.toLowerCase()}
        sx={{
          backgroundColor:
            status === "COMPLETED"
              ? "var(--primary-color-acc-2)"
              : status === "IN_PROGRESS"
              ? "var(--border-color)"
              : "var(--sec-color-acc-1)",
          color:
            status === "COMPLETED"
              ? "var(--primary-color)"
              : status === "IN_PROGRESS"
              ? "var(--text3)"
              : "var(--sec-color)",
          marginLeft: "auto",
        }}
      />
    </Stack>
  );
}
