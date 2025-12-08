"use client";
import { Add } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  DialogContent,
  Stack,
  Typography,
  Grid,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "../../context/SnackbarContext";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import DeleteDialogBox from "@/src/components/DeleteDialogBox/DeleteDialogBox";
import CouponDialog from "./Components/CouponDialog";
import CouponCard from "./Components/CouponCard";
import PageHeader from "./Components/PageHeader";

export default function Coupons() {
  const { showSnackbar } = useSnackbar();
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDialogDelete, setIsDialogDelete] = useState(false);

  const [courses, setCourses] = useState([]);
  const [goals, setGoals] = useState([]);

  const goalOptions = [
    { id: "ALL", title: "All" },
    { id: "COURSES", title: "Course" },
    { id: "GOALS", title: "Goal" },
  ];
  const discountTypeOptions = [
    { id: "PERCENTAGE", title: "Percentage" },
    { id: "FIXED", title: "Rupees" },
  ];

  const dialogOpen = () => {
    setSelectedCoupon({
      couponClass: "ALL",
      discountType: "PERCENTAGE",
      startDate: new Date().getTime(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)).getTime(),
      applicableCourses: [],
      applicableGoals: [],
    });
    setIsDialogOpen(true);
    setIsEditMode(false);
  };

  const dialogClose = () => {
    setIsDialogOpen(false);
    setSelectedCoupon(null);
    setIsEditMode(false);
  };

  const handleEditOpen = (coupon) => {
    setSelectedCoupon({
      ...coupon,
      applicableCourses: coupon.applicableCourses || [],
      applicableGoals: coupon.applicableGoals || [],
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const dialogDeleteOpen = (coupon) => {
    setSelectedCoupon(coupon);
    setIsDialogDelete(true);
  };

  const dialogDeleteClose = () => {
    setIsDialogDelete(false);
    setSelectedCoupon(null);
  };

  const validateCoupon = (coupon) => {
    if (!coupon.title) return "Please enter a Coupon Title";
    if (!coupon.code) return "Please enter a Coupon Code";
    if (!coupon.discountValue) return "Please enter a Discount Value";
    if (!coupon.minOrderAmount) return "Please enter a Minimum Order Amount";
    if (!coupon.maxDiscountPrice && coupon.discountType === "PERCENTAGE")
      return "Please enter a Maximum Discount Price";
    if (!coupon.totalRedemptions) return "Please enter Total Redemptions limit";
    if (!coupon.totalRedemptionsPerUser)
      return "Please enter Usage Limit Per User";
    if (!coupon.startDate || !coupon.endDate)
      return "Please select a valid Date Range";
    if (
      coupon.couponClass === "COURSES" &&
      (!coupon.applicableCourses || coupon.applicableCourses.length === 0)
    )
      return "Please select at least one course";
    if (
      coupon.couponClass === "GOALS" &&
      (!coupon.applicableGoals || coupon.applicableGoals.length === 0)
    )
      return "Please select at least one goal";
    return null;
  };

  const createCoupon = async () => {
    const error = validateCoupon(selectedCoupon);
    if (error) {
      showSnackbar(error, "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiFetch("/api/coupon/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedCoupon),
      });
      if (response.success) {
        showSnackbar("Coupon created successfully", "success");
        dialogClose();
        fetchCoupons();
      } else {
        showSnackbar(response.error, "error");
      }
    } catch (error) {
      showSnackbar(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const updateCoupon = async () => {
    const error = validateCoupon(selectedCoupon);
    if (error) {
      showSnackbar(error, "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiFetch("/api/coupon/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedCoupon),
      });
      if (response.success) {
        showSnackbar("Coupon updated successfully", "success");
        dialogClose();
        fetchCoupons();
      } else {
        showSnackbar(response.error, "error");
      }
    } catch (error) {
      showSnackbar(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch("/api/coupon/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: selectedCoupon.id }),
      });
      if (response.success) {
        showSnackbar("Coupon deleted successfully", "success");
        dialogDeleteClose();
        fetchCoupons();
      } else {
        showSnackbar(response.error, "error");
      }
    } catch (error) {
      showSnackbar(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch("/api/coupon/get-all/");
      if (response.success) {
        setCoupons(response.data);
      } else {
        showSnackbar(response.error, "error");
      }
    } catch (error) {
      showSnackbar(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [showSnackbar]);

  const fetchCoursesAndGoals = useCallback(async () => {
    try {
      const [coursesRes, goalsRes] = await Promise.all([
        apiFetch("/api/course/get-all/"),
        apiFetch("/api/goals/get-all-goals/"),
      ]);

      if (coursesRes.success) {
        setCourses(coursesRes.data);
      }
      if (goalsRes.success) {
        setGoals(goalsRes.data.goals || []);
      }
    } catch (error) {
      console.error("Error fetching courses/goals:", error);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
    fetchCoursesAndGoals();
  }, [fetchCoupons, fetchCoursesAndGoals]);

  return (
    <Stack gap="0px" padding="24px">
      <PageHeader
        title="Coupons & Offers"
        action={
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
            Create Coupon
          </Button>
        }
      />

      <CouponDialog
        isDialogOpen={isDialogOpen}
        dialogClose={dialogClose}
        coupon={selectedCoupon || {}}
        setCoupon={setSelectedCoupon}
        createCoupon={createCoupon}
        goalOptions={goalOptions}
        discountTypeOptions={discountTypeOptions}
        isEditMode={isEditMode}
        isLoading={isLoading}
        updateCoupon={updateCoupon}
        courses={courses}
        goals={goals}
      />

      {isLoading ? (
        <Stack alignItems="center" justifyContent="center" minHeight="300px">
          <CircularProgress />
        </Stack>
      ) : coupons.length > 0 ? (
        <Grid container spacing={3}>
          {coupons.map((item, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <CouponCard
                coupon={item}
                onEdit={() => handleEditOpen(item)}
                onDelete={() => dialogDeleteOpen(item)}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Stack
          width="100%"
          minHeight="60vh"
          alignItems="center"
          justifyContent="center"
        >
          <NoDataFound info="No Coupons Added" />
        </Stack>
      )}

      <DeleteDialogBox
        isOpen={isDialogDelete}
        onClose={dialogDeleteClose}
        actionButton={
          <Stack
            flexDirection="row"
            gap="16px"
            justifyContent="center"
            sx={{ width: "100%" }}
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
            >
              Delete
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
      >
        <DialogContent>
          <Typography align="center" color="var(--text2)">
            Are you sure you want to delete this coupon? This action cannot be
            undone.
          </Typography>
        </DialogContent>
      </DeleteDialogBox>
    </Stack>
  );
}
