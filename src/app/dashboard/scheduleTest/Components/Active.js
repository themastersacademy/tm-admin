"use client";
import ScheduledExamCard from "@/src/components/ScheduledExamCard/ScheduledExamCard";
import { Box, Stack, Card, Skeleton } from "@mui/material";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";

function ExamCardSkeleton() {
  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        padding: "18px",
        borderRadius: "14px",
        border: "1px solid var(--border-color)",
      }}
    >
      <Stack gap="14px">
        <Stack direction="row" alignItems="flex-start" gap="12px">
          <Skeleton
            variant="rounded"
            animation="wave"
            sx={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              flexShrink: 0,
            }}
          />
          <Stack flex={1} gap="6px">
            <Skeleton variant="text" animation="wave" width="70%" sx={{ fontSize: "15px" }} />
            <Skeleton variant="text" animation="wave" width="50%" sx={{ fontSize: "12px" }} />
          </Stack>
          <Skeleton variant="rounded" animation="wave" width={70} height={24} sx={{ borderRadius: "12px" }} />
        </Stack>
        <Skeleton
          variant="rounded"
          animation="wave"
          height={50}
          sx={{ borderRadius: "10px" }}
        />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Skeleton variant="text" animation="wave" width={120} sx={{ fontSize: "11px" }} />
          <Stack direction="row" gap="6px">
            <Skeleton variant="rounded" animation="wave" width={32} height={32} sx={{ borderRadius: "8px" }} />
            <Skeleton variant="rounded" animation="wave" width={32} height={32} sx={{ borderRadius: "8px" }} />
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

export default function Active({ testList, isLoading }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "16px",
        width: "100%",
        alignContent: "start",
      }}
    >
      {!isLoading ? (
        testList.length > 0 ? (
          testList.map((test) => (
            <ScheduledExamCard key={test.id} exam={test} />
          ))
        ) : (
          <Box sx={{ gridColumn: "1 / -1", height: "60vh" }}>
            <NoDataFound info="No exams found" />
          </Box>
        )
      ) : (
        [...Array(8)].map((_, index) => <ExamCardSkeleton key={index} />)
      )}
    </Box>
  );
}
