"use client";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import { apiFetch } from "@/src/lib/apiFetch";
import {
  Add,
  Close,
  East,
  CheckCircle,
  WorkspacePremium,
  CalendarToday,
  AttachMoney,
  History,
  Star,
  LocalOffer,
} from "@mui/icons-material";
import {
  Button,
  Chip,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  Switch,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Grid,
} from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { enqueueSnackbar } from "notistack";

export default function StudentSubscription() {
  const { id } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${id}/get-subscription`
      );
      if (response.success) {
        setSubscriptions(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch subscriptions", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const activeSubscription = subscriptions.find((s) => s.status === "active");
  const pastSubscriptions = subscriptions.filter((s) => s.status !== "active");

  return (
    <Stack gap="32px" padding="24px">
      {/* Header & Actions */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack>
          <Typography
            sx={{
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--text1)",
              fontFamily: "Lato",
            }}
          >
            Subscription Management
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "var(--text3)" }}>
            Manage student&apos;s active plan and view billing history
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsDialogOpen(true)}
          sx={{
            backgroundColor: "var(--primary-color)",
            textTransform: "none",
            borderRadius: "8px",
          }}
          disableElevation
        >
          Assign Plan
        </Button>
      </Stack>

      {isLoading ? (
        <Stack alignItems="center" padding="40px">
          <CircularProgress />
        </Stack>
      ) : (
        <>
          {/* Active Plan Section */}
          {activeSubscription ? (
            <ActivePlanCard
              subscription={activeSubscription}
              userId={id}
              onUpdate={fetchSubscriptions}
            />
          ) : (
            <Stack
              alignItems="center"
              justifyContent="center"
              padding="40px"
              sx={{
                backgroundColor: "var(--bg-color)",
                borderRadius: "16px",
                border: "1px dashed var(--border-color)",
              }}
            >
              <WorkspacePremium
                sx={{ fontSize: "48px", color: "var(--text3)", mb: 2 }}
              />
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--text2)",
                }}
              >
                No Active Subscription
              </Typography>
              <Typography
                sx={{ fontSize: "14px", color: "var(--text3)", mt: 1 }}
              >
                Assign a plan to unlock premium features for this student.
              </Typography>
            </Stack>
          )}

          {/* History Section */}
          {pastSubscriptions.length > 0 && (
            <Stack gap="16px">
              <Stack direction="row" alignItems="center" gap="8px">
                <History sx={{ color: "var(--text3)" }} />
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--text2)",
                  }}
                >
                  Subscription History
                </Typography>
              </Stack>
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  border: "1px solid var(--border-color)",
                  borderRadius: "12px",
                }}
              >
                <Table>
                  <TableHead sx={{ backgroundColor: "var(--bg-color)" }}>
                    <TableRow>
                      <TableCell
                        sx={{ fontWeight: 600, color: "var(--text2)" }}
                      >
                        Plan Name
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 600, color: "var(--text2)" }}
                      >
                        Duration
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 600, color: "var(--text2)" }}
                      >
                        Amount
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 600, color: "var(--text2)" }}
                      >
                        Purchased On
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 600, color: "var(--text2)" }}
                      >
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pastSubscriptions.map((sub, index) => (
                      <TableRow key={index}>
                        <TableCell
                          sx={{ fontWeight: 600, color: "var(--text1)" }}
                        >
                          {sub.plan?.name || "Unknown Plan"}
                        </TableCell>
                        <TableCell sx={{ color: "var(--text2)" }}>
                          {sub.plan?.duration}{" "}
                          {sub.plan?.type === "MONTHLY" ? "Months" : "Years"}
                        </TableCell>
                        <TableCell sx={{ color: "var(--text2)" }}>
                          ₹{sub.plan?.priceWithTax}
                        </TableCell>
                        <TableCell sx={{ color: "var(--text2)" }}>
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={sub.status}
                            size="small"
                            color={
                              sub.status === "expired" ? "default" : "error"
                            }
                            variant="outlined"
                            sx={{
                              textTransform: "capitalize",
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}
        </>
      )}

      <AddSubscriptionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        userId={id}
        onSuccess={fetchSubscriptions}
      />
    </Stack>
  );
}

const ActivePlanCard = ({ subscription, userId, onUpdate }) => {
  const [isActive, setIsActive] = useState(subscription.status === "active");

  const handleStatusChange = async (e) => {
    const newStatus = e.target.checked;
    setIsActive(newStatus);
    try {
      await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/update-subscription-status`,
        {
          method: "POST",
          body: JSON.stringify({
            subscriptionID: subscription.id,
            isActive: newStatus,
          }),
        }
      );
      enqueueSnackbar("Subscription status updated", { variant: "success" });
      onUpdate();
    } catch (error) {
      setIsActive(!newStatus); // Revert on error
      enqueueSnackbar("Failed to update status", { variant: "error" });
    }
  };

  return (
    <Stack
      sx={{
        background: "linear-gradient(135deg, #1a237e 0%, #283593 100%)",
        borderRadius: "16px",
        padding: "32px",
        color: "white",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(40, 53, 147, 0.2)",
      }}
    >
      {/* Background Decoration */}
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -40,
          left: -40,
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
        }}
      />

      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={7}>
          <Stack gap="12px">
            <Chip
              label="Current Active Plan"
              size="small"
              sx={{
                backgroundColor: "rgba(76, 175, 80, 0.2)",
                color: "#4CAF50",
                border: "1px solid rgba(76, 175, 80, 0.3)",
                width: "fit-content",
                fontWeight: 700,
              }}
              icon={<CheckCircle sx={{ fontSize: "14px !important" }} />}
            />
            <Typography
              sx={{
                fontSize: "36px",
                fontWeight: 800,
                fontFamily: "Lato",
                mt: 1,
              }}
            >
              {subscription.plan?.name || "Premium Plan"}
            </Typography>

            <Stack direction="row" gap="24px" mt={1}>
              <Stack direction="row" gap="8px" alignItems="center">
                <AttachMoney sx={{ opacity: 0.7 }} />
                <Typography sx={{ fontWeight: 600, fontSize: "18px" }}>
                  ₹{subscription.plan?.priceWithTax}
                </Typography>
              </Stack>
              <Stack direction="row" gap="8px" alignItems="center">
                <CalendarToday sx={{ opacity: 0.7 }} />
                <Typography sx={{ fontWeight: 600, fontSize: "16px" }}>
                  Expires:{" "}
                  {new Date(subscription.expiresAt).toLocaleDateString()}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack
            sx={{
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "20px",
              backdropFilter: "blur(10px)",
            }}
            gap="16px"
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                opacity: 0.8,
              }}
            >
              Plan Benefits
            </Typography>
            <Stack gap="8px">
              <BenefitItem text="Access to all premium courses" />
              <BenefitItem text="Unlimited mock tests" />
              <BenefitItem text="Priority support" />
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                backgroundColor: "rgba(0,0,0,0.2)",
                padding: "8px 16px",
                borderRadius: "8px",
                marginTop: "8px",
              }}
            >
              <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>
                Subscription Status
              </Typography>
              <Stack direction="row" alignItems="center" gap="8px">
                <Typography sx={{ fontSize: "12px", opacity: 0.8 }}>
                  {isActive ? "Active" : "Paused"}
                </Typography>
                <Switch
                  checked={isActive}
                  onChange={handleStatusChange}
                  size="small"
                  sx={{
                    "& .MuiSwitch-track": {
                      backgroundColor: "rgba(255,255,255,0.5)",
                    },
                    "& .MuiSwitch-thumb": { color: "white" },
                  }}
                />
              </Stack>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

const BenefitItem = ({ text }) => (
  <Stack direction="row" gap="8px" alignItems="center">
    <Star sx={{ fontSize: "16px", color: "#FFC107" }} />
    <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>{text}</Typography>
  </Stack>
);

const AddSubscriptionDialog = ({ isOpen, onClose, userId, onSuccess }) => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/subscription/get-all`)
        .then((res) => {
          if (res.status) {
            setPlans(res.data);
            // Auto-select the first plan if available
            if (res.data.length > 0 && !selectedPlan) {
              setSelectedPlan(res.data[0]);
            }
          }
        })
        .catch((err) => console.error(err));
    }
  }, [isOpen]);

  const handleAssign = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    try {
      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/add-subscription`,
        {
          method: "POST",
          body: JSON.stringify({ subscriptionPlanID: selectedPlan.id }),
        }
      );
      if (res.success) {
        enqueueSnackbar("Plan assigned successfully", { variant: "success" });
        onSuccess();
        onClose();
      } else {
        enqueueSnackbar(res.message || "Failed to assign plan", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Error assigning plan", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogBox
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Subscription Plan"
      customWidth="850px"
      icon={
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      }
      actionButton={
        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={!selectedPlan || loading}
          startIcon={loading ? null : <CheckCircle />}
          sx={{
            backgroundColor: "var(--primary-color)",
            textTransform: "none",
            padding: "10px 24px",
            fontWeight: 600,
          }}
        >
          {loading ? "Assigning..." : "Assign Plan"}
        </Button>
      }
    >
      <DialogContent sx={{ padding: 0, overflow: "hidden" }}>
        <Stack direction="row" sx={{ height: "450px" }}>
          {/* Left Panel: Plan List */}
          <Box
            sx={{
              width: "55%",
              borderRight: "1px solid #E0E0E0",
              overflowY: "auto",
              backgroundColor: "#FAFAFA",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                padding: "16px 20px",
                borderBottom: "1px solid #E0E0E0",
                backgroundColor: "#FFFFFF",
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#757575",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Available Plans ({plans.length})
              </Typography>
            </Box>

            <Stack gap="0">
              {plans.map((plan) => {
                const isSelected = selectedPlan?.id === plan.id;
                return (
                  <Stack
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    sx={{
                      padding: "20px",
                      borderBottom: "1px solid #F0F0F0",
                      backgroundColor: isSelected ? "#E3F2FD" : "#FFFFFF",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      position: "relative",
                      "&:hover": {
                        backgroundColor: isSelected ? "#E3F2FD" : "#F5F5F5",
                      },
                    }}
                  >
                    {isSelected && (
                      <Box
                        sx={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: "4px",
                          backgroundColor: "#2196F3",
                        }}
                      />
                    )}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Stack gap="4px">
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: isSelected ? "#1976D2" : "#212121",
                            fontSize: "15px",
                          }}
                        >
                          {plan.name}
                        </Typography>
                        <Stack direction="row" gap="6px" alignItems="center">
                          <CalendarToday
                            sx={{ fontSize: "14px", color: "#757575" }}
                          />
                          <Typography
                            sx={{ fontSize: "13px", color: "#757575" }}
                          >
                            {plan.duration}{" "}
                            {plan.type === "MONTHLY" ? "Months" : "Years"}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "16px",
                          color: isSelected ? "#2196F3" : "#424242",
                        }}
                      >
                        ₹{plan.priceWithTax}
                      </Typography>
                    </Stack>
                  </Stack>
                );
              })}
            </Stack>
          </Box>

          {/* Right Panel: Details */}
          <Box
            sx={{
              width: "45%",
              backgroundColor: "#FFFFFF",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            {!selectedPlan ? (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ height: "100%", textAlign: "center" }}
              >
                <WorkspacePremium
                  sx={{ fontSize: "48px", color: "#E0E0E0", mb: 2 }}
                />
                <Typography sx={{ color: "#9E9E9E" }}>
                  Select a plan to view details
                </Typography>
              </Stack>
            ) : (
              <Stack gap="24px">
                {/* Header */}
                <Stack gap="8px" alignItems="center" textAlign="center">
                  <Box
                    sx={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      backgroundColor: "#E3F2FD",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1,
                    }}
                  >
                    <WorkspacePremium
                      sx={{ fontSize: "32px", color: "#2196F3" }}
                    />
                  </Box>
                  <Typography
                    sx={{ fontSize: "20px", fontWeight: 800, color: "#212121" }}
                  >
                    {selectedPlan.name}
                  </Typography>
                  <Chip
                    label={`${selectedPlan.duration} ${
                      selectedPlan.type === "MONTHLY" ? "Months" : "Years"
                    } Access`}
                    size="small"
                    sx={{
                      backgroundColor: "#E3F2FD",
                      color: "#1976D2",
                      fontWeight: 600,
                    }}
                  />
                </Stack>

                {/* Price Box */}
                <Box
                  sx={{
                    backgroundColor: "#FAFAFA",
                    padding: "20px",
                    borderRadius: "12px",
                    border: "1px dashed #BDBDBD",
                    textAlign: "center",
                  }}
                >
                  <Typography sx={{ fontSize: "13px", color: "#757575" }}>
                    Total Price
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "32px",
                      fontWeight: 800,
                      color: "#2E7D32",
                      lineHeight: 1.2,
                    }}
                  >
                    ₹{selectedPlan.priceWithTax}
                  </Typography>
                  {selectedPlan.discountInPercent > 0 && (
                    <Stack
                      direction="row"
                      justifyContent="center"
                      alignItems="center"
                      gap="6px"
                      mt="8px"
                    >
                      <LocalOffer sx={{ fontSize: "16px", color: "#E65100" }} />
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#E65100",
                        }}
                      >
                        {selectedPlan.discountInPercent}% Discount Applied
                      </Typography>
                    </Stack>
                  )}
                </Box>

                {/* Benefits / Info */}
                <Stack gap="12px">
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#9E9E9E",
                      textTransform: "uppercase",
                    }}
                  >
                    Includes
                  </Typography>
                  <BenefitItem text="Full access to premium content" />
                  <BenefitItem text="Unlimited practice tests" />
                  <BenefitItem text="Performance analytics" />
                </Stack>
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>
    </DialogBox>
  );
};
