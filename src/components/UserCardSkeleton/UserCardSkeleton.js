import { Skeleton, Stack } from "@mui/material";

export default function UserCardSkeleton() {
  return (
    <Stack
      sx={{
        padding: "12px",
        borderRadius: "10px",
        width: "100%",
        maxWidth: "350px",
        height: "110px",
        gap: "10px",
        display: "flex",
        flexDirection: "column",
        border: "1px solid var(--border-color)",
      }}
    >
      <Stack flexDirection="row" gap="20px">
        <Skeleton
          variant="circular"
          animation="wave"
          sx={{ width: "50px", height: "50px" }}
        />
        <Stack flexDirection="column" gap="5px">
          <Skeleton variant="text" animation="wave" sx={{ width: "100px" }} />
          <Skeleton variant="text" animation="wave" sx={{ width: "100px" }} />
        </Stack>
        <Skeleton
          variant="text"
          animation="wave"
          sx={{ width: "100px", height: "40px", marginLeft: "auto" }}
        />
      </Stack>
    </Stack>
  );
}
