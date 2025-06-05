import { Skeleton, Stack } from "@mui/material";

export default function LessonCardSkeleton() {
  return (
    <Stack
      flexDirection="row"
      alignItems="center"
      sx={{
        width: "100%",
        height: "60px",
        gap: "10px",
        border: "1px solid var(--border-color)",
        backgroundColor: "var(--sec-color-acc-2)",
        padding: "0px 20px 0px 20px",
        borderRadius: "4px",
      }}
    >
      <Stack flexDirection="row" gap="20px" alignItems="center">
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{ width: "20px", borderRadius: "4px" }}
        />
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{ width: "275px", height: "35px", borderRadius: "4px" }}
        />
      </Stack>
      <Stack
        flexDirection="row"
        alignItems="center"
        sx={{ marginLeft: "auto", gap: "25px" }}
      >
        <Skeleton
          variant="rectangular"
          sx={{ width: "40px", borderRadius: "3px" }}
        />
      </Stack>
    </Stack>
  );
}
