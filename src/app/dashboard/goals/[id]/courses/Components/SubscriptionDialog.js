"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import StyledSelect from "@/src/components/StyledSelect/StyledSelect";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { Close, East } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  DialogContent,
  IconButton,
  Stack,
} from "@mui/material";
import { useSnackbar } from "@/src/app/context/SnackbarContext";

export default function SubscriptionDialog({
  isOpen,
  dialogClose,
  course,
  handleSubscription,
  isLoading,
  editIndex,
  setEditIndex,
}) {
  const { showSnackbar } = useSnackbar();
  const [newPlan, setNewPlan] = useState({
    type: "",
    duration: "",
    priceWithTax: "",
    discountInPercent: "",
  });

  // Memoize static plan options and durations
  const planOptions = useMemo(
    () => [
      { id: "MONTHLY", title: "Monthly" },
      { id: "YEARLY", title: "Yearly" },
    ],
    []
  );

  const monthly = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => ({
        id: String(i + 1),
        title: String(i + 1),
      })),
    []
  );

  const yearly = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        id: String(i + 1),
        title: String(i + 1),
      })),
    []
  );

  useEffect(() => {
    if (editIndex != null) {
      setNewPlan(course.subscription.plans[editIndex]);
    }
  }, [editIndex, course.subscription.plans]);

  const updatePlan = useCallback((key, value) => {
    setNewPlan((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleEdit = useCallback(
    (index, plan) => {
      const updatedPlans = course.subscription.plans.map((p, i) =>
        i === index ? plan : p
      );
      handleSubscription({ plans: updatedPlans });
      showSnackbar("Updated", "success", "", "3000");
      setEditIndex(null);
      dialogClose();
    },
    [
      course.subscription.plans,
      handleSubscription,
      setEditIndex,
      dialogClose,
      showSnackbar,
    ]
  );

  const saveSubscription = useCallback(() => {
    if (!newPlan.type || !newPlan.duration || !newPlan.priceWithTax) {
      return showSnackbar("Fill all data", "error", "", "3000");
    }
    const updatedPlans = [...course.subscription.plans, newPlan];
    handleSubscription({ plans: updatedPlans });
    setNewPlan({
      type: "",
      duration: "",
      priceWithTax: "",
      discountInPercent: "",
    });
    dialogClose();
    setEditIndex(null);
  }, [
    newPlan,
    course.subscription.plans,
    handleSubscription,
    dialogClose,
    setEditIndex,
    showSnackbar,
  ]);

  const handleSave = useCallback(() => {
    if (editIndex != null) {
      handleEdit(editIndex, newPlan);
    } else {
      saveSubscription();
    }
  }, [editIndex, handleEdit, newPlan, saveSubscription]);

  return (
    <DialogBox
      isOpen={isOpen}
      title="Create Subscription Plan"
      actionButton={
        <Button
          variant="text"
          sx={{ textTransform: "none", color: "var(--primary-color)" }}
          endIcon={<East />}
          onClick={handleSave}
        >
          {isLoading ? (
            <CircularProgress
              size={20}
              sx={{ color: "var(--primary-color)" }}
            />
          ) : editIndex == null ? (
            "Save"
          ) : (
            "Update"
          )}
        </Button>
      }
      icon={
        <IconButton
          onClick={() => {
            dialogClose();
            setEditIndex(null);
          }}
          sx={{ borderRadius: "5px", padding: "4px" }}
        >
          <Close sx={{ color: "var(--text3)" }} />
        </IconButton>
      }
    >
      <DialogContent>
        <Stack gap="20px">
          <StyledSelect
            title="Select Plan"
            options={planOptions}
            value={newPlan.type}
            onChange={(e) => updatePlan("type", e.target.value)}
          />
          <Stack flexDirection="row" gap="20px">
            <StyledSelect
              title="Select Duration"
              options={newPlan.type === "MONTHLY" ? monthly : yearly}
              value={newPlan.duration}
              onChange={(e) => updatePlan("duration", e.target.value)}
              disabled={!newPlan.type}
            />
            <StyledTextField
              placeholder="Enter Price"
              value={newPlan.priceWithTax}
              onChange={(e) => updatePlan("priceWithTax", e.target.value)}
            />
          </Stack>
          <StyledTextField
            placeholder="Enter Discount %"
            value={newPlan.discountInPercent}
            onChange={(e) => updatePlan("discountInPercent", e.target.value)}
          />
        </Stack>
      </DialogContent>
    </DialogBox>
  );
}
