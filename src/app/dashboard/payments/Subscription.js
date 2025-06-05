"use client";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";
import StyledSelect from "@/src/components/StyledSelect/StyledSelect";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { apiFetch } from "@/src/lib/apiFetch";
import {
  Add,
  Close,
  East,
  PlaylistAddCheck,
  Edit,
  Delete,
} from "@mui/icons-material";
import {
  Button,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useSnackbar } from "../../context/SnackbarContext";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import DeleteDialogBox from "@/src/components/DeleteDialogBox/DeleteDialogBox";

export default function Subscription() {
  const [subscription, setSubscription] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [priceWithTax, setPriceWithTax] = useState("");
  const [duration, setDuration] = useState("");
  const [discountInPercent, setDiscountInPercent] = useState("");
  const { showSnackbar } = useSnackbar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogDelete, setIsDialogDelete] = useState(false);
  const [selectedSubscriptionID, setSelectedSubscriptionID] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const dialogOpen = () => {
    setIsDialogOpen(true);
    setIsEditMode(false);
    setTitle("");
    setPriceWithTax("");
    setDuration("");
    setDiscountInPercent("");
  };

  const dialogClose = () => {
    setIsDialogOpen(false);
    setSelectedSubscriptionID(null);
    setIsEditMode(false);
  };

  const dialogDeleteOpen = (subscriptionID) => {
    setSelectedSubscriptionID(subscriptionID);
    setIsDialogDelete(true);
  };

  const dialogDeleteClose = () => {
    setSelectedSubscriptionID(null);
    setIsDialogDelete(false);
  };

  const handleEditOpen = (sub) => {
    setSelectedSubscriptionID(sub.id);
    setTitle(sub.type);
    setPriceWithTax(sub.priceWithTax);
    setDuration(sub.duration);
    setDiscountInPercent(sub.discountInPercent);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  {
    /* Fetch Subscription */
  }

  const fetchSubscription = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/subscription/get-all`
      );
      if (data.status) {
        setSubscription(data.data || []);
      } else {
        setSubscription([]);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      setSubscription([]);
    }
    setIsLoading(false);
  }, []);

  {
    /* Delete Subscription */
  }

  const handleDelete = useCallback(async () => {
    if (!selectedSubscriptionID) {
      showSnackbar(
        "No subscription selected for deletion",
        "error",
        "",
        "3000"
      );
      return;
    }

    showSnackbar(
      "Deleting...",
      "success",
      <CircularProgress size={20} sx={{ color: "var(--primary-color)" }} />,
      ""
    );
    setIsLoading(true);

    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/subscription/delete`,
        {
          method: "POST",
          body: JSON.stringify({ id: selectedSubscriptionID }),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (data && data.status) {
        setSubscription((prev) =>
          prev.filter((sub) => sub.id !== selectedSubscriptionID)
        );
        await fetchSubscription();
        showSnackbar(
          "Subscription deleted successfully",
          "success",
          "",
          "3000"
        );
      } else {
        showSnackbar(
          data?.message || "Failed to delete subscription",
          "error",
          "",
          "3000"
        );
      }
    } catch (error) {
      console.error("Error deleting subscription:", error);
      showSnackbar("Error deleting subscription", "error", "", "3000");
    }
    setIsLoading(false);
    dialogDeleteClose();
  }, [selectedSubscriptionID, showSnackbar, fetchSubscription]);

  {
    /* Create Subscription */
  }

  const createSubscription = useCallback(() => {
    showSnackbar(
      "Creating...",
      "success",
      <CircularProgress size={20} sx={{ color: "var(--primary-color)" }} />,
      ""
    );
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/subscription/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: title,
        duration,
        priceWithTax: priceWithTax,
        discountInPercent: discountInPercent,
      }),
    }).then((data) => {
      if (data.status) {
        showSnackbar(
          "Subscription created successfully",
          "success",
          "",
          "3000"
        );
        setTitle("");
        setPriceWithTax("");
        setDuration("");
        setDiscountInPercent("");
        fetchSubscription();
        dialogClose();
      } else {
        showSnackbar(
          data.message || "Failed to create subscription",
          "error",
          "",
          "3000"
        );
      }
    });
  }, [
    title,
    duration,
    priceWithTax,
    discountInPercent,
    showSnackbar,
    fetchSubscription,
  ]);

  {
    /* Update Subscription */
  }

  const updateSubscription = useCallback(async () => {
    if (!selectedSubscriptionID) {
      showSnackbar("No subscription selected for update", "error", "", "3000");
      return;
    }

    showSnackbar(
      "Syncing...",
      "success",
      <CircularProgress size={20} sx={{ color: "var(--primary-color)" }} />,
      ""
    );
    setIsLoading(true);

    const updatedSub = {
      id: selectedSubscriptionID,
      type: title,
      duration,
      priceWithTax,
      discountInPercent,
    };
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/subscription/update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedSub),
        }
      );

      if (data.status) {
        setSubscription((prev) =>
          prev.map((sub) =>
            sub.id === selectedSubscriptionID ? { ...sub, ...updatedSub } : sub
          )
        );
        await fetchSubscription();
        showSnackbar(
          "Subscription updated successfully",
          "success",
          "",
          "3000"
        );
      } else {
        showSnackbar(
          data.message || "Failed to update subscription",
          "error",
          "",
          "3000"
        );
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      showSnackbar("Error updating subscription", "error", "", "3000");
    }
    setIsLoading(false);
    dialogClose();
  }, [
    selectedSubscriptionID,
    title,
    duration,
    priceWithTax,
    discountInPercent,
    showSnackbar,
    fetchSubscription,
  ]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return (
    <Stack
      sx={{
        gap: "15px",
        marginTop: "20px",
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        backgroundColor: "var(--white)",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <Stack flexDirection="row" justifyContent="space-between">
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "20px",
            fontWeight: "700",
            color: "var(--text3)",
          }}
        >
          PRO subscription
        </Typography>
        <Stack flexDirection="row" gap="10px" alignItems="flex-end">
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={dialogOpen}
            sx={{
              backgroundColor: "var(--primary-color)",
              textTransform: "none",
              height: "40px",
              borderRadius: "4px",
              minWidth: "100px",
            }}
            disableElevation
          >
            Add
          </Button>
        </Stack>
        <CreateDialog
          isDialogOpen={isDialogOpen}
          dialogClose={dialogClose}
          createSubscription={createSubscription}
          updateSubscription={updateSubscription}
          subscription={{
            type: title,
            duration,
            priceWithTax,
            discountInPercent,
          }}
          setSubscription={(updates) => {
            setTitle(updates.type);
            setDuration(updates.duration);
            setPriceWithTax(updates.priceWithTax);
            setDiscountInPercent(updates.discountInPercent);
          }}
          isEditMode={isEditMode}
          isLoading={isLoading}
        />
      </Stack>
      <Stack flexDirection="row" flexWrap="wrap" gap="20px">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <SecondaryCardSkeleton key={index} />
          ))
        ) : subscription.length > 0 ? (
          subscription.map((item, index) => (
            <SecondaryCard
              key={index}
              title={`₹${item.priceWithTax}`}
              subTitle={
                <Stack flexDirection="row" gap="10px">
                  <Stack>{`${item.duration} ${
                    item.type === "MONTHLY" ? "months" : "years"
                  }`}</Stack>
                  <Stack>{`${item.discountInPercent}% off`}</Stack>
                </Stack>
              }
              icon={
                <PlaylistAddCheck
                  sx={{ color: "var(--sec-color)", fontSize: "34px" }}
                />
              }
              options={[
                <MenuItem
                  key="edit"
                  onClick={() => handleEditOpen(item)}
                  sx={{ borderRadius: "4px", fontSize: "14px", gap: "5px" }}
                >
                  <Edit sx={{ fontSize: "16px" }} /> Edit
                </MenuItem>,
                <MenuItem
                  key="delete"
                  onClick={() => dialogDeleteOpen(item.id)}
                  sx={{
                    borderRadius: "4px",
                    fontSize: "14px",
                    color: "var(--delete-color)",
                    gap: "5px",
                  }}
                >
                  <Delete sx={{ fontSize: "16px" }} /> Delete
                </MenuItem>,
              ]}
              cardWidth="350px"
            />
          ))
        ) : (
          <Stack width="100%" minHeight="60vh">
            <NoDataFound info="No subscription created yet" />
          </Stack>
        )}
      </Stack>
      <DeleteDialogBox
        isOpen={isDialogDelete}
        onClose={dialogDeleteClose}
        actionButton={
          <Stack
            flexDirection="row"
            justifyContent="center"
            sx={{ gap: "20px", width: "100%" }}
          >
            {isLoading ? (
              <CircularProgress
                size={20}
                sx={{ color: "var(--primary-color)" }}
              />
            ) : (
              <>
                <Button
                  variant="contained"
                  onClick={handleDelete}
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
              </>
            )}
            <Button
              variant="contained"
              onClick={dialogDeleteClose}
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
    </Stack>
  );
}

const CreateDialog = ({
  isDialogOpen,
  dialogClose,
  createSubscription,
  updateSubscription,
  subscription,
  setSubscription,
  isEditMode,
  isLoading,
}) => {
  const planOptions = [
    { id: "MONTHLY", title: "Monthly" },
    { id: "YEARLY", title: "Yearly" },
  ];

  const monthly = Array.from({ length: 11 }, (_, i) => ({
    id: String(i + 1),
    title: String(i + 1),
  }));

  const yearly = Array.from({ length: 5 }, (_, i) => ({
    id: String(i + 1),
    title: String(i + 1),
  }));

  const durationOptions = subscription.type === "MONTHLY" ? monthly : yearly;

  return (
    <DialogBox
      isOpen={isDialogOpen}
      title={isEditMode ? "Edit Subscription" : "Add Subscription"}
      icon={
        <IconButton
          sx={{ borderRadius: "8px", padding: "4px" }}
          onClick={dialogClose}
          disabled={isLoading}
        >
          <Close />
        </IconButton>
      }
      actionButton={
        <Button
          variant="text"
          endIcon={<East />}
          onClick={isEditMode ? updateSubscription : createSubscription}
          sx={{ textTransform: "none", color: "var(--primary-color)" }}
          disabled={isLoading}
        >
          {isEditMode ? "Update Subscription" : "Add Subscription"}
        </Button>
      }
    >
      <DialogContent>
        <Stack gap="10px">
          <StyledSelect
            title="Monthly / Yearly"
            value={subscription.type}
            onChange={(e) =>
              setSubscription({
                ...subscription,
                type: e.target.value,
                duration: "", // Reset duration when type changes
              })
            }
            options={planOptions}
            disabled={isLoading}
          />
          <Stack flexDirection="row" gap="10px" justifyContent="space-between">
            <StyledSelect
              title="Select duration"
              value={subscription.duration}
              onChange={(e) =>
                setSubscription({ ...subscription, duration: e.target.value })
              }
              options={durationOptions}
              disabled={isLoading || !subscription.type}
            />
            <StyledTextField
              placeholder="Enter rupees"
              value={subscription.priceWithTax}
              onChange={(e) =>
                setSubscription({
                  ...subscription,
                  priceWithTax: e.target.value,
                })
              }
              disabled={isLoading}
            />
            <StyledTextField
              placeholder="Discount %"
              type="number"
              value={subscription.discountInPercent}
              onChange={(e) =>
                setSubscription({
                  ...subscription,
                  discountInPercent: e.target.value,
                })
              }
              disabled={isLoading}
            />
          </Stack>
        </Stack>
      </DialogContent>
    </DialogBox>
  );
};
