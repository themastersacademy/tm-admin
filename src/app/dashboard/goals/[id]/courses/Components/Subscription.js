"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { apiFetch } from "@/src/lib/apiFetch";
import {
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { Add, Delete, Edit, PlaylistAddCheck } from "@mui/icons-material";
import StyledSelect from "@/src/components/StyledSelect/StyledSelect";
import StyledSwitch from "@/src/components/StyledSwitch/StyledSwitch";
import SubscriptionDialog from "./SubscriptionDialog";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import DeleteDialogBox from "@/src/components/DeleteDialogBox/DeleteDialogBox";

export default function Subscription({ course, setCourse }) {
  const { showSnackbar } = useSnackbar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  // Memoize static userPlan
  const userPlan = useMemo(
    () => [
      { id: "all", title: "All Users" },
      { id: "pro", title: "Pro Users" },
    ],
    []
  );

  // UI state: isFreeOn and selectedUser are derived from course.subscription.
  // When the switch is off, no sync is triggered by the switch.
  const [isFreeOn, setIsFreeOn] = useState(
    course.subscription?.isFree || course.subscription?.isPro || false
  );
  const [selectedUser, setSelectedUser] = useState(
    course.subscription?.isFree
      ? "all"
      : course.subscription?.isPro
      ? "pro    "
      : ""
  );

  useEffect(() => {
    if (course.subscription) {
      setIsFreeOn(course.subscription.isFree || course.subscription.isPro);
      setSelectedUser(
        course.subscription.isFree
          ? "all"
          : course.subscription.isPro
          ? "pro"
          : ""
      );
    } else {
      setIsFreeOn(false);
      setSelectedUser("");
    }
  }, [course]);

  // Sync subscription update with backend.
  const handleSubscription = useCallback(
    async (updatedSubscription) => {
      showSnackbar(
        "Syncing...",
        "success",
        <CircularProgress size={20} sx={{ color: "var(--primary-color)" }} />,
        ""
      );
      const updatedSub = { ...course.subscription, ...updatedSubscription };
      const updatedCourse = { ...course, subscription: updatedSub };
      setIsLoading(true);
      setCourse(updatedCourse);
      try {
        const data = await apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/courses/update/subscription`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              courseID: course.id,
              goalID: course.goalID,
              subscription: updatedSub,
            }),
          }
        );
        showSnackbar(
          data.success ? "Synced" : data.message,
          data.success ? "success" : "error",
          "",
          "3000"
        );
      } catch (error) {
        console.error(error);
        showSnackbar("Update failed", "error", "", "3000");
      }
      setIsLoading(false);
    },
    [course, setCourse, showSnackbar]
  );

  // When switch changes: if off, sync immediately; if on, update UI only.
  const handleSwitchChange = useCallback(
    (e) => {
      const newValue = e.target.checked;
      setIsFreeOn(newValue);
      if (!newValue) {
        // When turned off, force both flags false.
        handleSubscription({ isFree: false, isPro: false });
      }
    },
    [handleSubscription]
  );

  // When the select changes, update the subscription if the switch is on.
  const handleSelectChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      setSelectedUser(newValue);
      if (isFreeOn) {
        handleSubscription({
          isFree: newValue === "all",
          isPro: newValue === "pro",
        });
      }
    },
    [isFreeOn, handleSubscription]
  );

  const handleDelete = useCallback(
    (index) => {
      const updatedPlans = course.subscription.plans.filter(
        (_, i) => i !== index
      );
      handleSubscription({ plans: updatedPlans });
      showSnackbar("Deleted", "success", "", "3000");
      setDeleteIndex(null);
    },
    [course, handleSubscription, showSnackbar]
  );

  return (
    <Stack marginTop="20px" gap="20px">
      <Typography
        sx={{
          fontFamily: "Lato",
          fontSize: "18px",
          fontWeight: 700,
          color: "var(--text3)",
        }}
      >
        Subscription
      </Typography>
      <Stack flexDirection="row" gap={10}>
        <Stack gap="5px">
          <Typography
            sx={{ fontFamily: "Lato", fontSize: "15px", color: "var(--text3)" }}
          >
            Is free
          </Typography>
          <StyledSwitch checked={isFreeOn} onChange={handleSwitchChange} />
        </Stack>
        <Stack gap="10px">
          <Typography
            sx={{ fontFamily: "Lato", fontSize: "15px", color: "var(--text3)" }}
          >
            Free for
          </Typography>
          <Stack sx={{ width: "360px" }}>
            <StyledSelect
              title="Select User"
              options={userPlan}
              disable={!isFreeOn}
              value={selectedUser}
              getLabel={(sub) => sub.title}
              getValue={(sub) => sub.id}
              onChange={handleSelectChange}
              onBlur={(e) =>
                isFreeOn &&
                handleSubscription({
                  isFree: e.target.value === "all",
                  isPro: e.target.value === "pro",
                })
              }
            />
          </Stack>
        </Stack>
      </Stack>
      <Stack
        sx={{
          opacity: isFreeOn ? 0.3 : 1,
          pointerEvents: isFreeOn ? "none" : "auto",
        }}
      >
        <Stack flexDirection="row" justifyContent="space-between" mb="15px">
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--text3)",
            }}
          >
            Plans
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setIsDialogOpen(true)}
            sx={{
              backgroundColor: "var(--primary-color)",
              textTransform: "none",
            }}
            disableElevation
          >
            Create
          </Button>
        </Stack>
        <SubscriptionDialog
          isOpen={isDialogOpen}
          dialogClose={() => setIsDialogOpen(false)}
          course={course}
          setCourse={setCourse}
          handleSubscription={handleSubscription}
          isLoading={isLoading}
          editIndex={editIndex}
          setEditIndex={setEditIndex}
        />
        <Stack
          flexDirection="row"
          flexWrap="wrap"
          rowGap="10px"
          columnGap="40px"
          alignItems="center"
        >
          {!isLoading ? (
            course.subscription.plans.length > 0 ? (
              course.subscription.plans.map((plan, index) => (
                <SecondaryCard
                  key={index}
                  icon={
                    <PlaylistAddCheck
                      sx={{ color: "var(--sec-color)", fontSize: "30px" }}
                    />
                  }
                  title={`${plan.type} Subscription (${plan.duration} ${
                    plan.type === "MONTHLY" ? "months" : "years"
                  })`}
                  options={[
                    <MenuItem
                      key="edit"
                      sx={{ borderRadius: "4px", fontSize: "14px", gap: "5px" }}
                      onClick={() => {
                        setEditIndex(index);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit sx={{ fontSize: "16px" }} /> Edit
                    </MenuItem>,
                    <MenuItem
                      key="delete"
                      sx={{
                        borderRadius: "4px",
                        fontSize: "14px",
                        color: "var(--delete-color)",
                        gap: "5px",
                      }}
                      onClick={() => {
                        setDeleteIndex(index);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Delete sx={{ fontSize: "16px" }} /> Delete
                    </MenuItem>,
                  ]}
                  cardWidth="500px"
                  subTitle={`₹${plan.priceWithTax || "0"} (${
                    plan.discountInPercent
                  }% Off)`}
                />
              ))
            ) : (
              <NoDataFound info="No Subscription plans available, create one" />
            )
          ) : (
            <SecondaryCardSkeleton />
          )}
        </Stack>
      </Stack>
      <DeleteSubscription
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        deleteIndex={deleteIndex}
        handleDelete={handleDelete}
      />
    </Stack>
  );
}

const DeleteSubscription = ({ isOpen, onClose, deleteIndex, handleDelete }) => (
  <DeleteDialogBox
    isOpen={isOpen}
    actionButton={
      <Stack
        flexDirection="row"
        justifyContent="center"
        sx={{ gap: "20px", width: "100%" }}
      >
        <Button
          variant="contained"
          onClick={() => {
            onClose();
            handleDelete(deleteIndex);
          }}
          sx={{
            textTransform: "none",
            backgroundColor: "var(--delete-color)",
            borderRadius: "5px",
            width: "130px",
          }}
          disableElevation
        >
          Delete
        </Button>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            textTransform: "none",
            borderRadius: "5px",
            backgroundColor: "white",
            color: "var(--text2)",
            border: "1px solid var(--border-color)",
            width: "130px",
          }}
          disableElevation
        >
          Cancel
        </Button>
      </Stack>
    }
  />
);
