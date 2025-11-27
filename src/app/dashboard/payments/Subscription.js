"use client";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import StyledSelect from "@/src/components/StyledSelect/StyledSelect";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { apiFetch } from "@/src/lib/apiFetch";
import {
  Add,
  Close,
  East,
  Edit,
  Delete,
  WorkspacePremium,
  CheckCircle,
  LocalOffer,
  CalendarToday,
} from "@mui/icons-material";
import {
  Button,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  CircularProgress,
  Grid,
  Card,
  Chip,
  Box,
  Divider,
} from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useSnackbar } from "../../context/SnackbarContext";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
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
    <Stack gap="20px" padding="20px">
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography
          sx={{
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--text1)",
          }}
        >
          Subscription Plans
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={dialogOpen}
          sx={{
            background: "linear-gradient(135deg, #4CAF50 0%, #45A049 100%)",
            color: "#FFFFFF",
            textTransform: "none",
            borderRadius: "10px",
            padding: "10px 24px",
            fontWeight: 700,
            fontSize: "14px",
            boxShadow: "0 4px 12px rgba(76, 175, 80, 0.25)",
            "&:hover": {
              background: "linear-gradient(135deg, #45A049 0%, #3D8B40 100%)",
              boxShadow: "0 6px 16px rgba(76, 175, 80, 0.35)",
              transform: "translateY(-1px)",
            },
          }}
          disableElevation
        >
          Add Plan
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

const PlanCard = ({ plan, onEdit, onDelete }) => {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid var(--border-color)",
        borderRadius: "16px",
        padding: "24px",
        position: "relative",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 12px 24px rgba(0,0,0,0.05)",
          transform: "translateY(-4px)",
          borderColor: "var(--primary-color)",
        },
      }}
    >
      {plan.discountInPercent > 0 && (
        <Chip
          icon={<LocalOffer sx={{ fontSize: "14px !important" }} />}
          label={`${plan.discountInPercent}% OFF`}
          size="small"
          sx={{
            position: "absolute",
            top: "16px",
            right: "16px",
            backgroundColor: "#E3F2FD",
            color: "#1976D2",
            fontWeight: 700,
            fontSize: "12px",
          }}
        />
      )}

      <Stack gap="16px">
        <Stack direction="row" gap="12px" alignItems="center">
          <Box
            sx={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "var(--primary-color-acc-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary-color)",
            }}
          >
            <WorkspacePremium />
          </Box>
          <Stack>
            <Typography
              sx={{ fontSize: "18px", fontWeight: 700, color: "var(--text1)" }}
            >
              {plan.type === "MONTHLY" ? "Monthly Plan" : "Yearly Plan"}
            </Typography>
            <Stack direction="row" gap="4px" alignItems="center">
              <CalendarToday sx={{ fontSize: "14px", color: "var(--text3)" }} />
              <Typography sx={{ fontSize: "13px", color: "var(--text3)" }}>
                {plan.duration} {plan.type === "MONTHLY" ? "Months" : "Years"}
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ borderStyle: "dashed" }} />

        <Stack>
          <Typography
            sx={{ fontSize: "32px", fontWeight: 800, color: "var(--text1)" }}
          >
            ₹{plan.priceWithTax}
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "var(--text3)" }}>
            inclusive of all taxes
          </Typography>
        </Stack>

        <Stack direction="row" gap="12px" marginTop="8px">
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={onEdit}
            fullWidth
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              borderColor: "var(--border-color)",
              color: "var(--text2)",
            }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            startIcon={<Delete />}
            onClick={onDelete}
            fullWidth
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              borderColor: "var(--delete-color)",
              color: "var(--delete-color)",
              "&:hover": {
                backgroundColor: "#FFEBEE",
                borderColor: "var(--delete-color)",
              },
            }}
          >
            Delete
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
};

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
    title: `${i + 1} Month${i === 0 ? "" : "s"}`,
  }));

  const yearly = Array.from({ length: 5 }, (_, i) => ({
    id: String(i + 1),
    title: `${i + 1} Year${i === 0 ? "" : "s"}`,
  }));

  const durationOptions = subscription.type === "MONTHLY" ? monthly : yearly;

  return (
    <DialogBox
      isOpen={isDialogOpen}
      title={isEditMode ? "Edit Subscription Plan" : "Add New Plan"}
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
          variant="contained"
          endIcon={<East />}
          onClick={isEditMode ? updateSubscription : createSubscription}
          sx={{
            background: "linear-gradient(135deg, #4CAF50 0%, #45A049 100%)",
            color: "#FFFFFF",
            textTransform: "none",
            borderRadius: "10px",
            padding: "10px 24px",
            fontWeight: 700,
            fontSize: "14px",
            boxShadow: "0 4px 12px rgba(76, 175, 80, 0.25)",
            "&:hover": {
              background: "linear-gradient(135deg, #45A049 0%, #3D8B40 100%)",
              boxShadow: "0 6px 16px rgba(76, 175, 80, 0.35)",
              transform: "translateY(-1px)",
            },
          }}
          disableElevation
          disabled={isLoading}
        >
          {isEditMode ? "Update Plan" : "Create Plan"}
        </Button>
      }
    >
      <DialogContent>
        <Stack gap="24px" padding="8px 0">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <StyledSelect
                title="Plan Type"
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledSelect
                title="Duration"
                value={subscription.duration}
                onChange={(e) =>
                  setSubscription({ ...subscription, duration: e.target.value })
                }
                options={durationOptions}
                disabled={isLoading || !subscription.type}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                placeholder="Price (₹)"
                value={subscription.priceWithTax}
                onChange={(e) =>
                  setSubscription({
                    ...subscription,
                    priceWithTax: e.target.value,
                  })
                }
                disabled={isLoading}
                type="number"
              />
            </Grid>
            <Grid item xs={12}>
              <StyledTextField
                placeholder="Discount Percentage (%)"
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
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
    </DialogBox>
  );
};
