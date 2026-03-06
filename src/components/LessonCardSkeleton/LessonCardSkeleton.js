import { Skeleton, Stack } from "@mui/material";

export default function LessonCardSkeleton() {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap="8px"
      sx={{
        width: "100%",
        border: "1px solid var(--border-color)",
        backgroundColor: "var(--white)",
        padding: "8px 12px",
        borderRadius: "8px",
      }}
    >
      <Skeleton
        variant="rounded"
        animation="wave"
        sx={{ width: 16, height: 16, borderRadius: "4px", flexShrink: 0 }}
      />
      <Skeleton
        variant="rounded"
        animation="wave"
        sx={{ width: 24, height: 14, borderRadius: "4px", flexShrink: 0 }}
      />
      <Skeleton
        variant="rounded"
        animation="wave"
        sx={{ width: "40%", height: 14, borderRadius: "4px" }}
      />
      <Stack direction="row" alignItems="center" gap="6px" sx={{ marginLeft: "auto" }}>
        <Skeleton
          variant="rounded"
          animation="wave"
          sx={{ width: 50, height: 20, borderRadius: "6px" }}
        />
        <Skeleton
          variant="rounded"
          animation="wave"
          sx={{ width: 50, height: 20, borderRadius: "6px" }}
        />
      </Stack>
    </Stack>
  );
}
