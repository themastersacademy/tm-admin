import { Circle } from "@mui/icons-material";
import { Skeleton, Stack } from "@mui/material";

export default function CourseCardSkeleton() {
  return (
    <Stack
      alignItems="center"
      sx={{
        minWidth: "200px",
        minHeight: "250px",
        border: "1px solid",
        borderColor: "var(--border-color)",
        borderRadius: "10px",
      }}
    >
      <Skeleton
        variant="rectangular"
        animation="wave"
        sx={{
          width: "100%",
          height: "137px",
          borderRadius: "10px 10px 0 0",
          bgcolor: "var(--sec-color-acc-1)",
        }}
      />
      <Stack sx={{ padding: "10px", gap: "8px", width: "100%" }}>
        <Skeleton variant="text" sx={{ width: "80%" }} />
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            width: "50px",
            height: "20px",
            borderRadius: "4px",
            bgcolor: "var(--sec-color-acc-1)",
          }}
        />
        <Stack direction="row" gap="5px" alignItems={"center"}>
          <Skeleton variant="text" sx={{ width: "30%" }} />
          <Circle sx={{ fontSize: "10px", color: "var(--border-color)" }} />
          <Skeleton variant="text" sx={{ width: "30%" }} />
        </Stack>
        <Skeleton
          variant="rectangular"
          sx={{
            // marginTop: "auto",
            margin: "auto",
            width: "60px",
            bgcolor: "var(--primary-color-acc-2)",
            borderRadius: "5px",
            alignItems: "center",
          }}
        />
      </Stack>
    </Stack>
  );
}
