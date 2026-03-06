import { Card, Stack, Skeleton } from "@mui/material";

export default function SecondaryCardSkeleton({ questionCard, variant }) {
  if (variant === "folder") {
    return (
      <Card
        sx={{
          width: "100%",
          padding: "20px",
          borderRadius: "16px",
          border: "1px solid var(--border-color)",
        }}
        elevation={0}
      >
        <Stack gap="16px">
          <Skeleton
            variant="rounded"
            animation="wave"
            sx={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              bgcolor: "var(--sec-color-acc-1)",
            }}
          />
          <Stack gap="8px">
            <Skeleton
              variant="text"
              animation="wave"
              width="70%"
              sx={{ fontSize: "15px" }}
            />
            <Stack direction="row" gap={1.5} alignItems="center">
              <Skeleton
                variant="rounded"
                animation="wave"
                width={65}
                height={24}
                sx={{ borderRadius: "6px" }}
              />
              <Skeleton variant="text" animation="wave" width={50} />
            </Stack>
          </Stack>
        </Stack>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        width: questionCard ? "100%" : "350px",
        height: "80px",
        padding: "10px",
        borderRadius: "10px",
        border: "1px solid var(--border-color)",
      }}
      elevation={0}
    >
      <Stack alignItems="center" gap="7px" flexDirection="row">
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            width: "60px",
            height: "60px",
            borderRadius: "10px",
            bgcolor: "var(--sec-color-acc-1)",
          }}
        />
        <Skeleton variant="text" width={70} />
        <Skeleton variant="rounded" width={7} sx={{ marginLeft: "auto" }} />
      </Stack>
    </Card>
  );
}
