import DialogBox from "@/src/components/DialogBox/DialogBox";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import {
  Close,
  East,
  WorkspacePremium,
  CalendarMonth,
  AttachMoney,
  Percent,
} from "@mui/icons-material";
import {
  Button,
  DialogContent,
  IconButton,
  Stack,
  Grid,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
} from "@mui/material";
import SectionCard from "./SectionCard";
import Label from "./Label";
import PlanCard from "./PlanCard";

const SubscriptionDialog = ({
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

  const calculateFinalPrice = () => {
    const price = parseFloat(subscription.priceWithTax) || 0;
    const discount = parseFloat(subscription.discountInPercent) || 0;
    return (price - (price * discount) / 100).toFixed(0);
  };

  return (
    <DialogBox
      isOpen={isDialogOpen}
      title={
        <Stack direction="row" alignItems="center" gap={2}>
          <Box
            sx={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #F093FB 0%, #F5576C 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <WorkspacePremium sx={{ fontSize: "24px" }} />
          </Box>
          <Stack>
            <Typography
              sx={{ fontSize: "20px", fontWeight: 700, color: "var(--text1)" }}
            >
              {isEditMode ? "Edit Subscription Plan" : "Create New Plan"}
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "var(--text3)" }}>
              {isEditMode
                ? "Update plan details and pricing"
                : "Set up a new subscription tier for your users"}
            </Typography>
          </Stack>
        </Stack>
      }
      customWidth="1000px"
      icon={
        <IconButton
          onClick={dialogClose}
          sx={{
            borderRadius: "10px",
            padding: "10px",
            backgroundColor: "var(--bg-color)",
            "&:hover": { backgroundColor: "var(--border-color)" },
          }}
          disabled={isLoading}
        >
          <Close sx={{ fontSize: "20px", color: "var(--text1)" }} />
        </IconButton>
      }
      actionButton={
        <Button
          variant="contained"
          endIcon={<East />}
          onClick={isEditMode ? updateSubscription : createSubscription}
          sx={{
            background: "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)",
            color: "#FFFFFF",
            textTransform: "none",
            borderRadius: "10px",
            padding: "12px 32px",
            fontWeight: 700,
            fontSize: "15px",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
            "&:hover": {
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.25)",
              transform: "translateY(-1px)",
            },
            "&.Mui-disabled": {
              background: "#E0E0E0",
              color: "#9E9E9E",
              boxShadow: "none",
            },
            transition: "all 0.2s ease",
          }}
          disableElevation
          disabled={isLoading || !subscription.type}
        >
          {isEditMode ? "Update Plan" : "Create Plan"}
        </Button>
      }
    >
      <DialogContent sx={{ padding: "24px 32px" }}>
        <Grid container spacing={3}>
          {/* Left Column - Form */}
          <Grid item xs={12} lg={7}>
            <Stack gap={3}>
              {/* Plan Configuration */}
              <SectionCard
                title="Plan Configuration"
                helpText="Define the core attributes of your plan"
                icon={<WorkspacePremium sx={{ fontSize: "20px" }} />}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Label required helpText="Billing cycle type">
                      Plan Type
                    </Label>
                    <ToggleButtonGroup
                      value={subscription.type || "MONTHLY"}
                      exclusive
                      onChange={(e, value) => {
                        if (value) {
                          setSubscription({
                            ...subscription,
                            type: value,
                            duration: "", // Reset duration when type changes
                          });
                        }
                      }}
                      fullWidth
                      size="small"
                      sx={{
                        height: "40px",
                        "& .MuiToggleButton-root": {
                          textTransform: "none",
                          fontWeight: 600,
                          fontSize: "13px",
                          color: "var(--text2)",
                          borderColor: "var(--border-color)",
                          "&.Mui-selected": {
                            backgroundColor: "var(--primary-color-acc-2)",
                            color: "var(--primary-color)",
                            borderColor: "var(--primary-color)",
                            "&:hover": {
                              backgroundColor: "var(--primary-color-acc-2)",
                            },
                          },
                        },
                      }}
                    >
                      {planOptions.map((option) => (
                        <ToggleButton key={option.id} value={option.id}>
                          {option.title}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <Label required helpText="Duration of the plan">
                      Duration
                    </Label>
                    <ToggleButtonGroup
                      value={subscription.duration}
                      exclusive
                      onChange={(e, value) => {
                        if (value) {
                          setSubscription({ ...subscription, duration: value });
                        }
                      }}
                      fullWidth
                      size="small"
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        "& .MuiToggleButton-root": {
                          flex: "1 0 20%",
                          textTransform: "none",
                          fontWeight: 600,
                          fontSize: "13px",
                          color: "var(--text2)",
                          borderColor: "var(--border-color)",
                          "&.Mui-selected": {
                            backgroundColor: "var(--primary-color-acc-2)",
                            color: "var(--primary-color)",
                            borderColor: "var(--primary-color)",
                            "&:hover": {
                              backgroundColor: "var(--primary-color-acc-2)",
                            },
                          },
                        },
                      }}
                    >
                      {durationOptions.map((option) => (
                        <ToggleButton key={option.id} value={option.id}>
                          {option.title}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Grid>
                </Grid>
              </SectionCard>

              {/* Pricing Details */}
              <SectionCard
                title="Pricing Details"
                helpText="Set the price and any applicable discounts"
                icon={<AttachMoney sx={{ fontSize: "20px" }} />}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Label required helpText="Base price including tax">
                      Price (₹)
                    </Label>
                    <StyledTextField
                      placeholder="e.g. 999"
                      value={subscription.priceWithTax}
                      onChange={(e) =>
                        setSubscription({
                          ...subscription,
                          priceWithTax: e.target.value,
                        })
                      }
                      disabled={isLoading}
                      type="number"
                      InputProps={{
                        startAdornment: (
                          <Typography
                            sx={{
                              color: "var(--text3)",
                              mr: 1,
                              fontWeight: 600,
                            }}
                          >
                            ₹
                          </Typography>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Label helpText="Optional discount percentage">
                      Discount (%)
                    </Label>
                    <StyledTextField
                      placeholder="e.g. 10"
                      type="number"
                      value={subscription.discountInPercent}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val > 100) return;
                        setSubscription({
                          ...subscription,
                          discountInPercent: e.target.value,
                        });
                      }}
                      disabled={isLoading}
                      InputProps={{
                        endAdornment: (
                          <Percent
                            sx={{
                              fontSize: "16px",
                              color: "var(--text3)",
                            }}
                          />
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Price Summary */}
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: "8px",
                    backgroundColor: "#F8F9FA",
                    border: "1px dashed var(--border-color)",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      sx={{ fontSize: "13px", color: "var(--text2)" }}
                    >
                      Final Price per user
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "18px",
                        fontWeight: 800,
                        color: "var(--primary-color)",
                      }}
                    >
                      ₹{calculateFinalPrice()}
                    </Typography>
                  </Stack>
                </Box>
              </SectionCard>
            </Stack>
          </Grid>

          {/* Right Column - Live Preview */}
          <Grid item xs={12} lg={5}>
            <Stack gap={2} position="sticky" top={20}>
              <Box>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "var(--text1)",
                    mb: 2,
                  }}
                >
                  📱 Live Preview
                </Typography>
                {/* Mock Plan Card for Preview */}
                <Box sx={{ pointerEvents: "none" }}>
                  <PlanCard
                    plan={{
                      type: subscription.type || "MONTHLY",
                      duration: subscription.duration || "1",
                      priceWithTax: subscription.priceWithTax || "0",
                      discountInPercent: subscription.discountInPercent || "0",
                    }}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                </Box>
              </Box>

              {/* Pro Tips */}
              <Paper
                elevation={0}
                sx={{
                  padding: "16px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
                  border: "1px solid #90CAF9",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 700,
                    mb: 1,
                    color: "#1565C0",
                  }}
                >
                  💡 Pricing Strategy
                </Typography>
                <Stack gap={0.5}>
                  <Typography
                    sx={{ fontSize: "11px", color: "#1565C0", lineHeight: 1.5 }}
                  >
                    • Yearly plans usually offer 15-20% discount
                  </Typography>
                  <Typography
                    sx={{ fontSize: "11px", color: "#1565C0", lineHeight: 1.5 }}
                  >
                    • Prices ending in 9 (e.g., 999) convert better
                  </Typography>
                  <Typography
                    sx={{ fontSize: "11px", color: "#1565C0", lineHeight: 1.5 }}
                  >
                    • Highlight popular durations like 3 or 6 months
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
    </DialogBox>
  );
};

export default SubscriptionDialog;
