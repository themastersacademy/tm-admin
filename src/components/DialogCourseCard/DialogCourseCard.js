"use client";
import { Stack, Typography } from "@mui/material";
import Image from "next/image";
import defaultImage from "@/public/Images/videoThumbnail.svg";
import StyledSelect from "../StyledSelect/StyledSelect";

export default function DialogCourseCard({
  course,
  showPlanSelect,
  onSelect,
  selectedPlanIndex,
  handlePlanChange,
}) {
  const { isFree, isPro } = course.subscription;

  const handleCardClick = () => {
    onSelect(course, selectedPlanIndex);
  };

  return (
    <Stack
      sx={{
        width: "100%",
        minHeight: "80px",
        border:
          isFree && isPro
            ? "1px solid var(--delete-color)"
            : "2px solid var(--border-color)",
        padding: "10px",
        backgroundColor: "var(--white)",
        borderRadius: "10px",
        cursor: isFree && isPro ? "not-allowed" : "pointer",
        pointerEvents: isFree && isPro ? "none" : "auto",
      }}
      alignItems="center"
      flexDirection="row"
      gap="20px"
      onClick={handleCardClick}
    >
      <Stack>
        <Image
          src={course.thumbnail || defaultImage}
          alt={"course"}
          width={80}
          height={60}
        />
      </Stack>
      <Stack gap="2px">
        <Typography width="220px" sx={{ fontSize: "16px", fontFamily: "Lato" }}>
          {course.title}
        </Typography>
      </Stack>
      {/* {showPlanSelect && (
        <Stack width="150px">
          <StyledSelect
            title="Select Plan"
            options={course.subscription.plans.map((plan, index) => ({
              label: `${plan.duration} ${
                plan.type === "MONTHLY" ? "Months" : "Years"
              }`,
              value: index,
            }))}
            value={selectedPlanIndex}
            getLabel={(option) => option.label}
            getValue={(option) => option.value}
            onChange={(e) => handlePlanChange(e.target.value)}
          />
        </Stack>
      )} */}
       {showPlanSelect && (
      <Stack width="150px">
        <StyledSelect
          title="Select Plan"
          options={course.subscription.plans.map((plan, index) => ({
            label: `${plan.duration} ${
              plan.type === "MONTHLY" ? "Months" : "Years"
            }`,
            value: index,
          }))}
          getLabel={(option) => option.label}
          getValue={(option) => option.value}
          value={selectedPlanIndex}
          onChange={(e) => handlePlanChange(e.target.value)}
        />
      </Stack>
    )}
      <Stack>
        <Typography sx={{ fontSize: "14px", fontFamily: "Lato" }}>
          {course.lessons} Lessons
        </Typography>
        <Typography sx={{ fontSize: "12px", fontFamily: "Lato" }}>
          {course.duration} minutes
        </Typography>
      </Stack>
    </Stack>
  );
}
