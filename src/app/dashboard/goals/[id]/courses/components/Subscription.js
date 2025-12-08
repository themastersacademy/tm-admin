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
  Chip,
  IconButton,
  Menu,
  Divider,
} from "@mui/material";
import {
  Add,
  Delete,
  Edit,
  MoreVert,
  CheckCircle,
  Star,
  WorkspacePremium,
  Lock,
  Public,
  Diamond,
} from "@mui/icons-material";
import SubscriptionDialog from "./SubscriptionDialog";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import DeleteDialogBox from "@/src/components/DeleteDialogBox/DeleteDialogBox";

export default function Subscription({ course, setCourse }) {
  const { showSnackbar } = useSnackbar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuIndex, setMenuIndex] = useState(null);

  // Access Mode State: "PAID", "FREE", "PRO"
  const [accessMode, setAccessMode] = useState("PAID");

  useEffect(() => {
    if (course.subscription) {
      if (course.subscription.isFree) {
        setAccessMode("FREE");
      } else if (course.subscription.isPro) {
        setAccessMode("PRO");
      } else {
        setAccessMode("PAID");
      }
    } else {
      setAccessMode("PAID");
    }
  }, [course]);

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

  const handleAccessChange = useCallback(
    (mode) => {
      setAccessMode(mode);
      let updatePayload = {};

      if (mode === "FREE") {
        updatePayload = { isFree: true, isPro: false };
      } else if (mode === "PRO") {
        updatePayload = { isFree: false, isPro: true };
      } else {
        // PAID
        updatePayload = { isFree: false, isPro: false };
      }

      handleSubscription(updatePayload);
    },
    [handleSubscription]
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

  const handleMenuOpen = (event, index) => {
    setAnchorEl(event.currentTarget);
    setMenuIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuIndex(null);
  };

  const AccessCard = ({ mode, icon, title, description }) => {
    const isSelected = accessMode === mode;
    return (
      <Stack
        onClick={() => handleAccessChange(mode)}
        sx={{
          flex: 1,
          padding: "20px",
          borderRadius: "12px",
          border: `2px solid ${
            isSelected ? "var(--primary-color)" : "var(--border-color)"
          }`,
          backgroundColor: isSelected
            ? "rgba(var(--primary-rgb), 0.04)"
            : "var(--white)",
          cursor: "pointer",
          transition: "all 0.2s ease",
          position: "relative",
          "&:hover": {
            borderColor: isSelected ? "var(--primary-color)" : "var(--text3)",
            transform: "translateY(-2px)",
          },
        }}
      >
        {isSelected && (
          <CheckCircle
            sx={{
              position: "absolute",
              top: "12px",
              right: "12px",
              color: "var(--primary-color)",
              fontSize: "20px",
            }}
          />
        )}
        <Stack gap="12px" alignItems="center" textAlign="center">
          <Stack
            justifyContent="center"
            alignItems="center"
            sx={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: isSelected
                ? "var(--primary-color)"
                : "var(--bg-color)",
              color: isSelected ? "var(--white)" : "var(--text3)",
              marginBottom: "8px",
            }}
          >
            {icon}
          </Stack>
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "16px",
              fontWeight: 700,
              color: isSelected ? "var(--primary-color)" : "var(--text1)",
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontSize: "13px",
              color: "var(--text3)",
              lineHeight: 1.4,
            }}
          >
            {description}
          </Typography>
        </Stack>
      </Stack>
    );
  };

  return (
    <Stack marginTop="20px" gap="40px">
      {/* Access Control Section */}
      <Stack gap="16px">
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--text1)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Star sx={{ color: "var(--primary-color)" }} /> Access Control
        </Typography>
        <Stack
          direction={{ xs: "column", md: "row" }}
          gap="20px"
          alignItems="stretch"
        >
          <AccessCard
            mode="PAID"
            icon={<Lock />}
            title="Paid Course"
            description="Users must purchase a subscription plan to access this course."
          />
          <AccessCard
            mode="FREE"
            icon={<Public />}
            title="Free for Everyone"
            description="Open to all registered users. No payment required."
          />
          <AccessCard
            mode="PRO"
            icon={<Diamond />}
            title="Pro Members Only"
            description="Exclusive to Pro subscribers. Individual purchase is disabled."
          />
        </Stack>
      </Stack>

      {/* Paid Plans Section - Only visible if PAID mode is selected */}
      {accessMode === "PAID" && (
        <Stack gap="24px">
          <Stack
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack gap="4px">
              <Typography
                sx={{
                  fontFamily: "Lato",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--text1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <WorkspacePremium sx={{ color: "var(--primary-color)" }} />{" "}
                Subscription Plans
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Lato",
                  fontSize: "14px",
                  color: "var(--text3)",
                }}
              >
                Create paid plans for users who don't have free access
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
                padding: "8px 24px",
                fontWeight: 600,
                fontFamily: "Lato",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "var(--primary-color-dark)",
                  boxShadow: "none",
                },
              }}
            >
              Create Plan
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
            gap="24px"
            alignItems="flex-start"
          >
            {!isLoading ? (
              course.subscription.plans.length > 0 ? (
                course.subscription.plans.map((plan, index) => {
                  const price = parseFloat(plan.priceWithTax) || 0;
                  const discount = parseFloat(plan.discountInPercent) || 0;
                  const discountedPrice =
                    discount > 0
                      ? Math.round(price - (price * discount) / 100)
                      : price;

                  return (
                    <Stack
                      key={index}
                      sx={{
                        width: "100%",
                        maxWidth: "340px",
                        backgroundColor: "var(--white)",
                        borderRadius: "16px",
                        border: "1px solid var(--border-color)",
                        overflow: "hidden",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
                          borderColor: "var(--primary-color)",
                        },
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
                          position: "relative",
                        }}
                      >
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, index)}
                          size="small"
                          sx={{
                            position: "absolute",
                            top: "12px",
                            right: "12px",
                            color: "rgba(255,255,255,0.8)",
                            "&:hover": {
                              color: "white",
                              backgroundColor: "rgba(255,255,255,0.1)",
                            },
                          }}
                        >
                          <MoreVert />
                        </IconButton>

                        <Stack direction="row" gap="8px" alignItems="center">
                          <Chip
                            label={plan.type}
                            size="small"
                            sx={{
                              backgroundColor: "rgba(255,255,255,0.2)",
                              color: "white",
                              fontWeight: 700,
                              fontSize: "10px",
                              height: "20px",
                            }}
                          />
                          {plan.discountInPercent > 0 && (
                            <Chip
                              label={`${plan.discountInPercent}% OFF`}
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
                          {plan.duration}{" "}
                          {plan.type === "MONTHLY" ? "Months" : "Years"}
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
                          <Stack
                            direction="row"
                            alignItems="baseline"
                            gap="8px"
                          >
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
                            {plan.discountInPercent > 0 && (
                              <Typography
                                sx={{
                                  fontSize: "16px",
                                  color: "var(--text3)",
                                  textDecoration: "line-through",
                                  fontWeight: 500,
                                }}
                              >
                                ₹{plan.priceWithTax}
                              </Typography>
                            )}
                          </Stack>
                        </Stack>

                        <Divider />

                        <Stack gap="12px">
                          <Stack direction="row" gap="12px" alignItems="center">
                            <CheckCircle
                              sx={{
                                fontSize: "18px",
                                color: "var(--success-color)",
                              }}
                            />
                            <Typography
                              sx={{ fontSize: "14px", color: "var(--text2)" }}
                            >
                              Full Course Access
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Stack>
                  );
                })
              ) : (
                <Stack width="100%">
                  <NoDataFound
                    info="No subscription plans available"
                    subInfo='Click "Create Plan" to add a new pricing tier.'
                  />
                </Stack>
              )
            ) : (
              <SecondaryCardSkeleton />
            )}
          </Stack>
        </Stack>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: "8px",
            minWidth: "140px",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setEditIndex(menuIndex);
            setIsDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ fontSize: "14px", gap: "8px", fontWeight: 500 }}
        >
          <Edit fontSize="small" /> Edit Plan
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteIndex(menuIndex);
            setIsDeleteDialogOpen(true);
            handleMenuClose();
          }}
          sx={{
            fontSize: "14px",
            gap: "8px",
            fontWeight: 500,
            color: "var(--delete-color)",
          }}
        >
          <Delete fontSize="small" /> Delete Plan
        </MenuItem>
      </Menu>

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
