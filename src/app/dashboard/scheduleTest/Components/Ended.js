"use client";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";
import { East } from "@mui/icons-material";
import { Button, Stack, Typography } from "@mui/material";
import Image from "next/image";
import banking from "@/public/icons/banking.svg";
import { useRouter } from "next/navigation";

export default function Ended() {
  const router = useRouter();
  return (
    <Stack marginTop="20px" gap="20px" width="100%">
      <Stack flexDirection="row" flexWrap="wrap" gap="20px">
        <SecondaryCard
          title="Placements 1"
          icon={<Image src={banking} alt="" width={20} />}
          subTitle={
            <Stack flexDirection="row" alignItems="center" gap="10px">
              <Typography fontSize="12px">KPRIET</Typography>
              <Typography fontSize="12px">CSE II Year</Typography>
              <Typography fontSize="12px">120 Questions</Typography>
              <Typography fontSize="12px" fontWeight="700">
                2024-08-05
              </Typography>
            </Stack>
          }
          button={
            <Button
              variant="text"
              endIcon={<East />}
              onClick={() => {
                router.push(`/dashboard/scheduleTest/1`);
              }}
              sx={{ color: "var(--primary-color)", textTransform: "none" }}
            >
              View
            </Button>
          }
          cardWidth="500px"
        />
        <SecondaryCard
          title="Placements 2"
          icon={<Image src={banking} alt="" width={20} />}
          subTitle={
            <Stack flexDirection="row" alignItems="center" gap="10px">
              <Typography fontSize="12px">KPRIET</Typography>
              <Typography fontSize="12px">CSE II Year</Typography>
              <Typography fontSize="12px">120 Questions</Typography>
              <Typography fontSize="12px" fontWeight="700">
                2024-08-05
              </Typography>
            </Stack>
          }
          button={
            <Button
              variant="text"
              endIcon={<East />}
              sx={{ color: "var(--primary-color)", textTransform: "none" }}
            >
              View
            </Button>
          }
          cardWidth="500px"
        />
      </Stack>
    </Stack>
  );
}
