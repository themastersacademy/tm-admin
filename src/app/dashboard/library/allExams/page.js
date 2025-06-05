"use client";
import Header from "@/src/components/Header/Header";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";
import { AccountBalance, FilterAlt } from "@mui/icons-material";
import { Button, Stack, Typography } from "@mui/material";

export default function LibraryExam() {
  return (
    <Stack padding="20px" gap="20px">
      <Header
        title="Exams"
        search
        button={[
          <Button
            key="Filter"
            variant="contained"
            endIcon={<FilterAlt />}
            sx={{
              backgroundColor: "var(--primary-color)",
              textTransform: "none",
            }}
            disableElevation
          >
            Filter
          </Button>,
        ]}
      />
      <Stack flexDirection="row" columnGap="40px" rowGap="15px" flexWrap="wrap">
        <SecondaryCard
          icon={
            <AccountBalance
              sx={{ color: "var(--sec-color)" }}
              fontSize="large"
            />
          }
          title="Placements"
          cardWidth="500px"
          subTitle={
            <Stack flexDirection="row" gap="20px">
              <Typography
                sx={{
                  color: "var(--text3)",
                  fontFamily: "Lato",
                  fontSize: "12px",
                }}
              >
                Institute
              </Typography>
              <Typography
                sx={{
                  color: "var(--text3)",
                  fontFamily: "Lato",
                  fontSize: "12px",
                }}
              >
                2024-08-05
              </Typography>
              <Typography
                sx={{
                  color: "var(--text3)",
                  fontFamily: "Lato",
                  fontSize: "12px",
                }}
              >
                P.S.R Engineering College
              </Typography>
            </Stack>
          }
        />
      </Stack>
    </Stack>
  );
}
