import { Card, Skeleton, Stack } from "@mui/material";

export default function QuestionCardSkeleton() {
  return (
    <Card
      sx={{
        padding: "20px",
        borderRadius: "10px",
        width: "100%",
        height: "100px",
        gap:"10px",
        display: "flex",
        flexDirection: "column",
        border: "1px solid var(--border-color)",
      }}
      elevation={0}
    >
      
      <Stack flexDirection="row" gap="20px">
        <Skeleton variant="text" animation="wave" sx={{ width: "50px" }} />
        <Skeleton variant="text" animation="wave" sx={{ width: "50px" }} />
        <Skeleton variant="text" animation="wave" sx={{ width: "60px" }} />
      </Stack>
      <Skeleton variant="text" animation="wave" sx={{ width: "40%" }} />
    </Card>
  );
}
