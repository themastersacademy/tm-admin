"use client";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";
import { Stack, Button } from "@mui/material";
import banking from "@/public/Icons/banking.svg";
import Image from "next/image";
import { East } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";

export default function Active({ testList, isLoading }) {
  const router = useRouter();

  return (
    <Stack marginTop="20px" gap="20px" width="100%">
      <Stack flexDirection="row" flexWrap="wrap" gap="20px">
        {!isLoading ? (
          testList.length > 0 ? (
            testList.map((test, index) => (
              <SecondaryCard
                key={index}
                title={test.title}
                icon={<Image src={banking} alt="" width={20} />}
                button={
                  <Button
                    variant="contained"
                    endIcon={<East />}
                    onClick={() => {
                      router.push(`/dashboard/scheduleTest/${test.id}`);
                    }}
                    sx={{
                      backgroundColor: "var(--sec-color)",
                      color: "var(--white)",
                      textTransform: "none",
                      height: "35px",
                    }}
                    disableElevation
                  >
                    View
                  </Button>
                }
                cardWidth="500px"
              />
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
