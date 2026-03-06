"use client";
import React, { useState, useEffect, useCallback } from "react";
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
      showSnackbar("Syncing...", "loading", "", "");
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
          padding: "12px 16px",
          borderRadius: "8px",
          border: `1.5px solid ${
            isSelected ? "var(--primary-color)" : "var(--border-color)"
          }`,
          backgroundColor: isSelected
            ? "rgba(24, 113, 99, 0.04)"
            : "var(--white)",
          cursor: "pointer",
          transition: "all 0.15s ease",
          "&:hover": {
            borderColor: isSelected ? "var(--primary-color)" : "var(--text4)",
          },
        }}
      >
        <Stack direction="row" alignItems="center" gap="10px">
          <Stack
            justifyContent="center"
            alignItems="center"
            sx={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: isSelected
                ? "var(--primary-color)"
                : "var(--bg-color)",
              color: isSelected ? "var(--white)" : "var(--text3)",
              flexShrink: 0,
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: "16px" } })}
          </Stack>
          <Stack flex={1}>
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 700,
                color: isSelected ? "var(--primary-color)" : "var(--text1)",
              }}
            >
              {title}
            </Typography>
            <Typography
              sx={{
                fontSize: "11px",
                color: "var(--text4)",
                lineHeight: 1.3,
              }}
            >
              {description}
            </Typography>
          </Stack>
          {isSelected && (
            <CheckCircle
              sx={{
                color: "var(--primary-color)",
                fontSize: "16px",
                flexShrink: 0,
              }}
            />
          )}
        </Stack>
      </Stack>
    );
  };

  return (
    <Stack marginTop="12px" gap="20px">
      {/* Access Control */}
      <Stack gap="10px">
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--text1)",
          }}
        >
          Access Control
        </Typography>
        <Stack
          direction={{ xs: "column", md: "row" }}
          gap="10px"
          alignItems="stretch"
        >
          <AccessCard
            mode="PAID"
            icon={<Lock />}
            title="Paid Course"
            description="Users must purchase a plan"
          />
          <AccessCard
            mode="FREE"
            icon={<Public />}
            title="Free for Everyone"
            description="Open to all registered users"
          />
          <AccessCard
            mode="PRO"
            icon={<Diamond />}
            title="Pro Members Only"
            description="Exclusive to Pro subscribers"
          />
        </Stack>
      </Stack>

      {/* Paid Plans */}
      {accessMode === "PAID" && (
        <Stack gap="12px">
          <Stack
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--text1)",
              }}
            >
              Subscription Plans
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add sx={{ fontSize: "16px" }} />}
              onClick={() => setIsDialogOpen(true)}
              disableElevation
              sx={{
                backgroundColor: "var(--primary-color)",
                textTransform: "none",
                borderRadius: "8px",
                padding: "5px 16px",
                fontWeight: 600,
                fontSize: "12px",
                height: "32px",
                "&:hover": { backgroundColor: "var(--primary-color-dark)" },
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
            gap="12px"
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
                        maxWidth: "280px",
                        backgroundColor: "var(--white)",
                        borderRadius: "10px",
                        border: "1px solid var(--border-color)",
                        overflow: "hidden",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          borderColor: "var(--primary-color)",
                        },
                      }}
                    >
                      {/* Card Header */}
                      <Stack
                        padding="12px 16px"
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                          borderBottom: "2px solid var(--primary-color)",
                        }}
                      >
                        <Stack direction="row" gap="6px" alignItems="center">
                          <Chip
                            label={plan.type}
                            size="small"
                            sx={{
                              backgroundColor: "rgba(24, 113, 99, 0.08)",
                              color: "var(--primary-color)",
                              fontWeight: 700,
                              fontSize: "10px",
                              height: "20px",
                              "& .MuiChip-label": { padding: "0 6px" },
                            }}
                          />
                          {plan.discountInPercent > 0 && (
                            <Chip
                              label={`${plan.discountInPercent}% OFF`}
                              size="small"
                              sx={{
                                backgroundColor: "rgba(76, 175, 80, 0.08)",
                                color: "#4CAF50",
                                fontWeight: 700,
                                fontSize: "10px",
                                height: "20px",
                                "& .MuiChip-label": { padding: "0 6px" },
                              }}
                            />
                          )}
                        </Stack>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, index)}
                          size="small"
                          sx={{
                            width: 24,
                            height: 24,
                            color: "var(--text4)",
                          }}
                        >
                          <MoreVert sx={{ fontSize: "16px" }} />
                        </IconButton>
                      </Stack>

                      {/* Card Body */}
                      <Stack padding="12px 16px" gap="6px">
                        <Typography
                          sx={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "var(--text2)",
                          }}
                        >
                          {plan.duration}{" "}
                          {plan.type === "MONTHLY" ? "Months" : "Years"}
                        </Typography>
                        <Stack
                          direction="row"
                          alignItems="baseline"
                          gap="6px"
                        >
                          <Typography
                            sx={{
                              fontSize: "22px",
                              fontWeight: 800,
                              color: "var(--text1)",
                            }}
                          >
                            ₹{discountedPrice}
                          </Typography>
                          {plan.discountInPercent > 0 && (
                            <Typography
                              sx={{
                                fontSize: "13px",
                                color: "var(--text4)",
                                textDecoration: "line-through",
                              }}
                            >
                              ₹{plan.priceWithTax}
                            </Typography>
                          )}
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
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            borderRadius: "8px",
            minWidth: "120px",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setEditIndex(menuIndex);
            setIsDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ fontSize: "12px", gap: "6px", fontWeight: 600 }}
        >
          <Edit sx={{ fontSize: "14px" }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteIndex(menuIndex);
            setIsDeleteDialogOpen(true);
            handleMenuClose();
          }}
          sx={{
            fontSize: "12px",
            gap: "6px",
            fontWeight: 600,
            color: "#f44336",
          }}
        >
          <Delete sx={{ fontSize: "14px" }} /> Delete
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
        sx={{ gap: "12px", width: "100%" }}
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
            borderRadius: "8px",
            width: "100px",
            fontWeight: 600,
            fontSize: "12px",
            height: "34px",
          }}
          disableElevation
        >
          Delete
        </Button>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            borderColor: "var(--border-color)",
            color: "var(--text2)",
            width: "100px",
            fontWeight: 600,
            fontSize: "12px",
            height: "34px",
          }}
          disableElevation
        >
          Cancel
        </Button>
      </Stack>
    }
  />
);
