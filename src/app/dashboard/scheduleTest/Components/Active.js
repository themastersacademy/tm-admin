"use client";
import ScheduledExamCard from "@/src/components/ScheduledExamCard/ScheduledExamCard";
import { Stack } from "@mui/material";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";

export default function Active({ testList, isLoading }) {
  // Sort by createdAt timestamp (latest first)
  const sortedTestList = [...testList].sort((a, b) => {
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  return (
    <Stack marginTop="20px" gap="20px" width="100%">
      <Stack flexDirection="row" flexWrap="wrap" gap="30px" rowGap="15px">
        {!isLoading ? (
          sortedTestList.length > 0 ? (
            sortedTestList.map((test, index) => (
              <ScheduledExamCard key={index} exam={test} />
            ))
          ) : (
            <Stack width="100%" height="70vh">
              <NoDataFound info="No Scheduled exams created" />
            </Stack>
          )
        ) : (
          Array.from({ length: 5 }).map((_, index) => (
            <SecondaryCardSkeleton key={index} />
          ))
        )}
      </Stack>
    </Stack>
  );
}
