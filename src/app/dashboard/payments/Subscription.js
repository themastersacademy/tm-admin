"use client";
import { apiFetch } from "@/src/lib/apiFetch";
import { Add } from "@mui/icons-material";
import { Button, Stack, CircularProgress, Grid } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useSnackbar } from "../../context/SnackbarContext";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import DeleteDialogBox from "@/src/components/DeleteDialogBox/DeleteDialogBox";
import PlanCard from "./Components/PlanCard";
import SubscriptionDialog from "./Components/SubscriptionDialog";
import PageHeader from "./Components/PageHeader";

export default function Subscription() {
  const [subscription, setSubscription] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("MONTHLY");
  const [priceWithTax, setPriceWithTax] = useState("");
  const [duration, setDuration] = useState("1");
  const [discountInPercent, setDiscountInPercent] = useState("");
  const { showSnackbar } = useSnackbar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogDelete, setIsDialogDelete] = useState(false);
  const [selectedSubscriptionID, setSelectedSubscriptionID] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const dialogOpen = () => {
    setIsDialogOpen(true);
    setIsEditMode(false);
    setTitle("MONTHLY");
    setPriceWithTax("");
    setDuration("1");
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

  const createSubscription = useCallback(() => {
    if (!title || !duration || !priceWithTax) {
      showSnackbar("Please fill all required fields", "error", "", "3000");
      return;
    }
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
        discountInPercent: discountInPercent || "0",
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
      discountInPercent: discountInPercent || "0",
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
    <Stack gap="0px" padding="24px">
      <PageHeader
        title="Subscription Plans"
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={dialogOpen}
            sx={{
              background: "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)",
              color: "#FFFFFF",
              textTransform: "none",
              borderRadius: "10px",
              padding: "10px 24px",
              fontWeight: 700,
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.25)",
              "&:hover": {
                background: "linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)",
                boxShadow: "0 6px 16px rgba(25, 118, 210, 0.35)",
                transform: "translateY(-1px)",
              },
            }}
            disableElevation
          >
            Add Plan
          </Button>
        }
      />

      <SubscriptionDialog
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

      {isLoading ? (
        <Stack alignItems="center" justifyContent="center" minHeight="300px">
          <CircularProgress />
        </Stack>
      ) : subscription.length > 0 ? (
        <Grid container spacing={3}>
          {subscription.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <PlanCard
                plan={item}
                onEdit={() => handleEditOpen(item)}
                onDelete={() => dialogDeleteOpen(item.id)}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Stack
          width="100%"
          minHeight="50vh"
          alignItems="center"
          justifyContent="center"
        >
          <NoDataFound info="No subscription plans created yet" />
        </Stack>
      )}

      <DeleteDialogBox
        isOpen={isDialogDelete}
        onClose={dialogDeleteClose}
        actionButton={
          <Stack
            flexDirection="row"
            justifyContent="center"
            sx={{ gap: "16px", width: "100%" }}
          >
            <Button
              variant="contained"
              onClick={handleDelete}
              sx={{
                textTransform: "none",
                backgroundColor: "var(--delete-color)",
                borderRadius: "8px",
                width: "120px",
              }}
              disableElevation
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
            <Button
              variant="outlined"
              onClick={dialogDeleteClose}
              sx={{
                textTransform: "none",
                borderRadius: "8px",
                borderColor: "var(--border-color)",
                color: "var(--text2)",
                width: "120px",
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
