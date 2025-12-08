"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import StyledSelect from "@/src/components/StyledSelect/StyledSelect";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import {
  Close,
  CheckCircle,
  CalendarMonth,
  CalendarToday,
  AttachMoney,
  Percent,
} from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  Divider,
  Chip,
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
    type: "MONTHLY",
    duration: "",
    priceWithTax: "",
    discountInPercent: "",
  });

  const monthly = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => ({
        id: String(i + 1),
        title: `${i + 1} Month${i === 0 ? "" : "s"}`,
      })),
    []
  );

  const yearly = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        id: String(i + 1),
        title: `${i + 1} Year${i === 0 ? "" : "s"}`,
      })),
    []
  );

  useEffect(() => {
    if (editIndex != null) {
      setNewPlan(course.subscription.plans[editIndex]);
    } else {
      // Reset to default when opening fresh
      setNewPlan({
        type: "MONTHLY",
        duration: "",
        priceWithTax: "",
        discountInPercent: "",
      });
    }
  }, [editIndex, course.subscription.plans, isOpen]);

  const updatePlan = useCallback((key, value) => {
    setNewPlan((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleTypeChange = (event, newType) => {
    if (newType !== null) {
      updatePlan("type", newType);
      updatePlan("duration", ""); // Reset duration when type changes
    }
  };

  const handleSave = useCallback(() => {
    if (!newPlan.type || !newPlan.duration || !newPlan.priceWithTax) {
      return showSnackbar(
        "Please fill in all required fields",
        "error",
        "",
        "3000"
      );
    }

    const updatedPlans = [...course.subscription.plans];
    if (editIndex != null) {
      updatedPlans[editIndex] = newPlan;
    } else {
      updatedPlans.push(newPlan);
    }

    handleSubscription({ plans: updatedPlans });

    if (editIndex == null) {
      setNewPlan({
        type: "MONTHLY",
        duration: "",
        priceWithTax: "",
        discountInPercent: "",
      });
    }

    dialogClose();
    setEditIndex(null);
  }, [
    newPlan,
    course.subscription.plans,
    handleSubscription,
    dialogClose,
    editIndex,
    setEditIndex,
    showSnackbar,
  ]);

  const discountedPrice = useMemo(() => {
    const price = parseFloat(newPlan.priceWithTax) || 0;
    const discount = parseFloat(newPlan.discountInPercent) || 0;
    if (discount > 0) {
      return Math.round(price - (price * discount) / 100);
    }
    return price;
  }, [newPlan.priceWithTax, newPlan.discountInPercent]);

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        dialogClose();
        setEditIndex(null);
      }}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          height: "auto",
          maxHeight: "90vh",
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--text1)",
          }}
        >
          {editIndex != null
            ? "Edit Subscription Plan"
            : "Create Subscription Plan"}
        </Typography>
        <IconButton
          onClick={() => {
            dialogClose();
            setEditIndex(null);
          }}
          size="small"
        >
          <Close />
        </IconButton>
      </Stack>

      <DialogContent sx={{ padding: "0" }}>
        <Stack direction={{ xs: "column", md: "row" }} height="100%">
          {/* Left Column: Form */}
          <Stack
            flex={1}
            gap="24px"
            padding="24px"
            sx={{
              borderRight: { md: "1px solid var(--border-color)" },
            }}
          >
            {/* Plan Type */}
            <Stack gap="8px">
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--text2)",
                }}
              >
                Plan Type
              </Typography>
              <ToggleButtonGroup
                value={newPlan.type}
                exclusive
                onChange={handleTypeChange}
                fullWidth
                sx={{
                  "& .MuiToggleButton-root": {
                    textTransform: "none",
                    fontFamily: "Lato",
                    fontWeight: 600,
                    padding: "10px",
                    "&.Mui-selected": {
                      backgroundColor: "rgba(var(--primary-rgb), 0.1)",
                      color: "var(--primary-color)",
                      borderColor: "var(--primary-color)",
                      "&:hover": {
                        backgroundColor: "rgba(var(--primary-rgb), 0.2)",
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="MONTHLY">
                  <CalendarMonth sx={{ mr: 1, fontSize: "20px" }} /> Monthly
                </ToggleButton>
                <ToggleButton value="YEARLY">
                  <CalendarToday sx={{ mr: 1, fontSize: "20px" }} /> Yearly
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            {/* Duration */}
            <Stack gap="8px">
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--text2)",
                }}
              >
                Duration
              </Typography>
              <StyledSelect
                title={`Select ${
                  newPlan.type === "MONTHLY" ? "Months" : "Years"
                }`}
                options={newPlan.type === "MONTHLY" ? monthly : yearly}
                value={newPlan.duration}
                onChange={(e) => updatePlan("duration", e.target.value)}
              />
            </Stack>

            {/* Price & Discount */}
            <Stack direction="row" gap="16px">
              <Stack gap="8px" flex={1}>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--text2)",
                  }}
                >
                  Price (₹)
                </Typography>
                <StyledTextField
                  placeholder="0.00"
                  value={newPlan.priceWithTax}
                  onChange={(e) => updatePlan("priceWithTax", e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  type="number"
                />
              </Stack>
              <Stack gap="8px" flex={1}>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--text2)",
                  }}
                >
                  Discount (%)
                </Typography>
                <StyledTextField
                  placeholder="0"
                  value={newPlan.discountInPercent}
                  onChange={(e) =>
                    updatePlan("discountInPercent", e.target.value)
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Percent fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  type="number"
                />
              </Stack>
            </Stack>
          </Stack>

          {/* Right Column: Preview */}
          <Stack
            flex={1}
            padding="24px"
            gap="16px"
            alignItems="center"
            justifyContent="center"
            sx={{ backgroundColor: "#F8F9FA" }}
          >
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text3)",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Live Preview
            </Typography>

            {/* Preview Card */}
            <Stack
              sx={{
                width: "100%",
                maxWidth: "320px",
                backgroundColor: "var(--white)",
                borderRadius: "16px",
                border: "1px solid var(--border-color)",
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
              }}
            >
              {/* Card Header */}
              <Stack
                padding="20px"
                gap="8px"
                sx={{
                  background:
                    "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-dark) 100%)",
                  color: "var(--white)",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Chip
                    label={newPlan.type || "PLAN TYPE"}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "10px",
                      height: "20px",
                    }}
                  />
                  {newPlan.discountInPercent > 0 && (
                    <Chip
                      label={`${newPlan.discountInPercent}% OFF`}
                      size="small"
                      sx={{
                        backgroundColor: "var(--white)",
                        color: "var(--primary-color)",
                        fontWeight: 800,
                        fontSize: "10px",
                        height: "20px",
                      }}
                    />
                  )}
                </Stack>
                <Typography
                  sx={{
                    fontFamily: "Lato",
                    fontSize: "24px",
                    fontWeight: 800,
                  }}
                >
                  {newPlan.duration || "0"}{" "}
                  {newPlan.type === "MONTHLY" ? "Months" : "Years"}
                </Typography>
                <Typography sx={{ fontSize: "13px", opacity: 0.9 }}>
                  Full access to course content
                </Typography>
              </Stack>

              {/* Card Body */}
              <Stack padding="20px" gap="16px">
                <Stack gap="4px">
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "var(--text3)",
                      fontWeight: 600,
                    }}
                  >
                    TOTAL PRICE
                  </Typography>
                  <Stack direction="row" alignItems="baseline" gap="8px">
                    <Typography
                      sx={{
                        fontSize: "32px",
                        fontWeight: 800,
                        color: "var(--text1)",
                        fontFamily: "Lato",
                      }}
                    >
                      ₹{discountedPrice}
                    </Typography>
                    {newPlan.discountInPercent > 0 && (
                      <Typography
                        sx={{
                          fontSize: "16px",
                          color: "var(--text3)",
                          textDecoration: "line-through",
                          fontWeight: 500,
                        }}
                      >
                        ₹{newPlan.priceWithTax}
                      </Typography>
                    )}
                  </Stack>
                </Stack>

                <Divider />

                <Stack gap="12px">
                  {[
                    "Unlimited Access",
                    "Certificate of Completion",
                    "Premium Support",
                  ].map((feature, i) => (
                    <Stack
                      key={i}
                      direction="row"
                      gap="12px"
                      alignItems="center"
                    >
                      <CheckCircle
                        sx={{ fontSize: "18px", color: "var(--success-color)" }}
                      />
                      <Typography
                        sx={{ fontSize: "14px", color: "var(--text2)" }}
                      >
                        {feature}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>

      {/* Footer Actions */}
      <Stack
        direction="row"
        justifyContent="flex-end"
        gap="12px"
        padding="16px 24px"
        sx={{ borderTop: "1px solid var(--border-color)" }}
      >
        <Button
          onClick={() => {
            dialogClose();
            setEditIndex(null);
          }}
          sx={{
            textTransform: "none",
            color: "var(--text2)",
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isLoading}
          sx={{
            backgroundColor: "var(--primary-color)",
            textTransform: "none",
            borderRadius: "8px",
            padding: "8px 24px",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "var(--primary-color-dark)",
              boxShadow: "none",
            },
          }}
        >
          {isLoading ? (
            <CircularProgress size={20} sx={{ color: "white" }} />
          ) : editIndex != null ? (
            "Update Plan"
          ) : (
            "Create Plan"
          )}
        </Button>
      </Stack>
    </Dialog>
  );
}
