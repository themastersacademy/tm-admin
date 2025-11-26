import { Card, Stack, Box, Skeleton } from "@mui/material";

export default function ExamCardSkeleton() {
  return (
    <Card
      elevation={0}
      sx={{
        width: "350px",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
      }}
    >
      <Box sx={{ padding: "20px" }}>
        <Stack gap="16px">
          {/* Header */}
          <Stack
            flexDirection="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Skeleton variant="circular" width={48} height={48} />
            <Stack direction="row" gap="6px">
              <Skeleton
                variant="rounded"
                width={80}
                height={24}
                sx={{ borderRadius: "12px" }}
              />
              <Skeleton
                variant="rounded"
                width={70}
                height={24}
                sx={{ borderRadius: "12px" }}
              />
            </Stack>
          </Stack>

          {/* Title */}
          <Box>
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="60%" height={24} />
          </Box>

          <Skeleton variant="rectangular" width="100%" height={1} />

          {/* Details */}
          <Stack gap="12px">
            <Stack flexDirection="row" justifyContent="space-between">
              <Skeleton variant="text" width={100} height={20} />
              <Skeleton variant="text" width={120} height={20} />
            </Stack>

            <Skeleton
              variant="rounded"
              width="100%"
              height={52}
              sx={{ borderRadius: "8px" }}
            />

            <Stack flexDirection="row" justifyContent="space-between">
              <Skeleton variant="text" width={80} height={20} />
              <Skeleton variant="text" width={40} height={20} />
            </Stack>
          </Stack>

          {/* Action Buttons */}
          <Stack flexDirection="row" gap="8px">
            <Skeleton
              variant="rounded"
              width="50%"
              height={36}
              sx={{ borderRadius: "8px" }}
            />
            <Skeleton
              variant="rounded"
              width="50%"
              height={36}
              sx={{ borderRadius: "8px" }}
            />
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}
