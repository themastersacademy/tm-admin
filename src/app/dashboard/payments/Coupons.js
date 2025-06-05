"use client";
import SearchBox from "@/src/components/SearchBox/SearchBox";
import { Add, Close, DeleteRounded, East, Edit } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  DialogContent,
  IconButton,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import CouponCard from "@/src/components/CouponCard/CouponCard";
import StyledSelect from "@/src/components/StyledSelect/StyledSelect";
import { apiFetch } from "@/src/lib/apiFetch";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { MultiInputDateRangeField } from "@mui/x-date-pickers-pro/MultiInputDateRangeField";
import { useSnackbar } from "../../context/SnackbarContext";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import DeleteDialogBox from "@/src/components/DeleteDialogBox/DeleteDialogBox";

export default function Coupons() {
  const { showSnackbar } = useSnackbar();
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDialogDelete, setIsDialogDelete] = useState(false);

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
    setSelectedCoupon({});
    setIsDialogOpen(true);
    setIsEditMode(false);
  };

  const dialogClose = () => {
    setIsDialogOpen(false);
    setSelectedCoupon(null);
    setIsEditMode(false);
  };

  const handleEditOpen = (coupon) => {
    setSelectedCoupon(coupon);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const dialogDeleteOpen = (couponID) => {
    setSelectedCoupon(couponID);
    setIsDialogDelete(true);
  };

  const dialogDeleteClose = () => {
    setIsDialogDelete(false);
    setSelectedCoupon(null);
  };

  const createCoupon = () => {
    if (
      !selectedCoupon.title ||
      !selectedCoupon.code ||
      !selectedCoupon.couponClass ||
      !selectedCoupon.discountType ||
      !selectedCoupon.discountValue ||
      !selectedCoupon.minOrderAmount ||
      !selectedCoupon.maxDiscountPrice ||
      !selectedCoupon.totalRedemptions ||
      !selectedCoupon.totalRedemptionsPerUser ||
      !selectedCoupon.startDate ||
      !selectedCoupon.endDate
    ) {
      showSnackbar("Please fill all the fields", "error", "", "3000");
      return;
    }
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/coupon/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: selectedCoupon.title,
        code: selectedCoupon.code,
        couponClass: selectedCoupon.couponClass,
        discountType: selectedCoupon.discountType,
        discountValue: selectedCoupon.discountValue,
        maxDiscountPrice: selectedCoupon.maxDiscountPrice,
        minOrderAmount: selectedCoupon.minOrderAmount,
        totalRedemptions: selectedCoupon.totalRedemptions,
        totalRedemptionsPerUser: selectedCoupon.totalRedemptionsPerUser,
        startDate: selectedCoupon.startDate,
        endDate: selectedCoupon.endDate,
      }),
    }).then((data) => {
      if (data.success) {
        showSnackbar(data.message, "success", "", "3000");
        fetchCoupons();
        dialogClose();
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
    });
  };

  const fetchCoupons = () => {
    setIsLoading(true);
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/coupon/get-all`).then(
      (data) => {
        if (data.success) {
          setCoupons(data.data);
        }
        setIsLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const updateCoupon = useCallback(async () => {
    if (!selectedCoupon?.id) {
      showSnackbar("No coupon selected for update", "error", "", "3000");
      return;
    }

    showSnackbar(
      "Syncing...",
      "success",
      <CircularProgress size={20} sx={{ color: "var(--primary-color)" }} />,
      ""
    );
    setIsLoading(true);

    const updatedCoupon = {
      id: selectedCoupon.id,
      title: selectedCoupon.title,
      code: selectedCoupon.code,
      couponClass: selectedCoupon.couponClass,
      discountType: selectedCoupon.discountType,
      discountValue: selectedCoupon.discountValue,
      maxDiscountPrice: selectedCoupon.maxDiscountPrice,
      minOrderAmount: selectedCoupon.minOrderAmount,
      totalRedemptions: selectedCoupon.totalRedemptions,
      totalRedemptionsPerUser: selectedCoupon.totalRedemptionsPerUser,
      startDate: selectedCoupon.startDate,
      endDate: selectedCoupon.endDate,
      isActive: selectedCoupon.isActive,
    };

    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/coupon/update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedCoupon),
        }
      );

      if (data.success) {
        setCoupons((prev) =>
          prev.map((c) =>
            c.id === coupons.id ? { ...c, ...updatedCoupon } : c
          )
        );
        fetchCoupons();
        showSnackbar("Coupon updated successfully", "success", "", "3000");
      } else {
        showSnackbar(
          data.message || "Failed to update coupon",
          "error",
          "",
          "3000"
        );
      }
    } catch (error) {
      console.error("Error updating coupon:", error);
      showSnackbar("Error updating coupon", "error", "", "3000");
    }

    setIsLoading(false);
    dialogClose();
  }, [selectedCoupon, showSnackbar]);

  const handleDelete = useCallback(async () => {
    try {
      await apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/coupon/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: selectedCoupon }),
      }).then((data) => {
        if (data.success) {
          showSnackbar(data.message, "success", "", "3000");
          fetchCoupons();
          dialogDeleteClose();
        } else {
          showSnackbar(data.message, "error", "", "3000");
        }
      });
    } catch (error) {
      console.error("Error deleting coupon:", error);
      showSnackbar("Error deleting coupon", "error", "", "3000");
    }
  }, [showSnackbar, fetchCoupons, selectedCoupon]);

  return (
    <Stack marginTop="20px">
      <Stack
        padding="20px"
        sx={{
          padding: "20px",
          border: "1px solid var(--border-color)",
          minHeight: "90vh",
          backgroundColor: "var(--white)",
          borderRadius: "10px",
          gap: "20px",
          maxWidth: "1200px",
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
            Coupons
          </Typography>
          <Stack flexDirection="row" gap="10px" alignItems="flex-end">
            <SearchBox />
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
              New
            </Button>
          </Stack>
        </Stack>
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
        />
        <Stack gap="15px" flexDirection="row" flexWrap="wrap">
          {isLoading ? (
            <Stack gap="15px" flexWrap="wrap" flexDirection="row">
              <SecondaryCardSkeleton />
              <SecondaryCardSkeleton />
            </Stack>
          ) : coupons.length > 0 ? (
            coupons.map((item, index) => (
              <CouponCard
                key={index}
                name={item.title}
                duration={`${dayjs(item.startDate).format(
                  "MM/DD/YYYY"
                )} - ${dayjs(item.endDate).format("MM/DD/YYYY")}`}
                status={item.isActive ? "Active" : "Expired"}
                price={`₹ ${item.minOrderAmount} - ₹ ${item.maxDiscountPrice}`}
                code={item.code}
                subscriptionType={`Subscription/${item.couponClass}`}
                discount={`${item.discountValue}%`}
                redems={`${item.totalRedemptions} redeems & ${item.totalRedemptionsPerUser} left`}
                edit={() => handleEditOpen(item)}
                deleteCoupon={() => dialogDeleteOpen(item.id)}
              />
            ))
          ) : (
            <Stack width="100%" minHeight="60vh">
              <NoDataFound info="No Coupons Added" />
            </Stack>
          )}
        </Stack>
        <DeleteDialogBox
          isOpen={isDialogDelete}
          onClose={dialogDeleteClose}
          actionButton={
            <Stack
              flexDirection="row"
              gap="20px"
              justifyContent="center"
              sx={{ width: "100%" }}
            >
              <Button
                variant="contained"
                onClick={() => handleDelete({ id: selectedCoupon.id })}
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
                variant="outlined"
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
        >
          <DialogContent>
            <Typography>
              Are you sure you want to delete this coupon?
            </Typography>
          </DialogContent>
        </DeleteDialogBox>
      </Stack>
    </Stack>
  );
}

const CouponDialog = ({
  isDialogOpen,
  dialogClose,
  coupon,
  setCoupon,
  createCoupon,
  goalOptions,
  discountTypeOptions,
  isEditMode,
  isLoading,
  updateCoupon,
}) => {
  const defaultStartDate = dayjs();
  const defaultEndDate = dayjs().add(7, "day");
  const [dateRange, setDateRange] = useState([
    defaultStartDate,
    defaultEndDate,
  ]);

  const handleDateChange = (newDateRange) => {
    const [startDate, endDate] = newDateRange;
    setDateRange(newDateRange);
    setCoupon((prev) => ({
      ...prev,
      startDate: startDate.valueOf(),
      endDate: endDate.valueOf(),
    }));
  };

  return (
    <DialogBox
      isOpen={isDialogOpen}
      title={isEditMode ? "Edit Coupon" : "Add Coupon"}
      icon={
        <IconButton
          onClick={dialogClose}
          sx={{ borderRadius: "10px", padding: "6px" }}
          disabled={isLoading}
        >
          <Close sx={{ color: "var(--text2)" }} />
        </IconButton>
      }
      actionButton={
        <Button
          variant="text"
          onClick={() => {
            isEditMode ? updateCoupon() : createCoupon();
          }}
          endIcon={<East />}
          sx={{ textTransform: "none", color: "var(--primary-color)" }}
          disabled={isLoading && coupon.title === ""}
        >
          {isEditMode ? "Update Coupon" : "Add Coupon"}
        </Button>
      }
    >
      <DialogContent>
        <Stack gap="15px">
          <StyledTextField
            placeholder="Title"
            value={coupon.title || ""}
            onChange={(e) =>
              setCoupon((prev) => ({ ...prev, title: e.target.value }))
            }
          />
          <StyledTextField
            placeholder="Enter coupon text"
            value={coupon.code || ""}
            onChange={(e) =>
              setCoupon((prev) => ({ ...prev, code: e.target.value }))
            }
          />
          <StyledSelect
            title="Select Goal/Course"
            value={coupon.couponClass || ""}
            onChange={(e) =>
              setCoupon((prev) => ({
                ...prev,
                couponClass: e.target.value,
              }))
            }
            options={goalOptions}
          />
          <Stack flexDirection="row" gap="10px">
            <StyledSelect
              title="Select percentage/rupees"
              value={coupon.discountType || ""}
              onChange={(e) =>
                setCoupon((prev) => ({
                  ...prev,
                  discountType: e.target.value,
                }))
              }
              options={discountTypeOptions}
            />
            <StyledTextField
              placeholder={
                coupon.discountType === "PERCENTAGE"
                  ? "Enter percentage (Max: 100%)"
                  : "Enter rupees"
              }
              value={coupon.discountValue || ""}
              type="number"
              onChange={(e) => {
                const value = e.target.value;
                if (coupon.discountType === "PERCENTAGE" && value > 100) {
                  setCoupon((prev) => ({ ...prev, discountValue: 100 }));
                } else {
                  setCoupon((prev) => ({ ...prev, discountValue: value }));
                }
              }}
            />
          </Stack>
          <Stack flexDirection="row" gap="10px">
            <StyledTextField
              placeholder="Min purchase price"
              value={coupon.minOrderAmount || ""}
              type="number"
              onChange={(e) =>
                setCoupon((prev) => ({
                  ...prev,
                  minOrderAmount: e.target.value,
                }))
              }
            />
            <StyledTextField
              placeholder="Max. purchase price"
              value={coupon.maxDiscountPrice || ""}
              type="number"
              onChange={(e) =>
                setCoupon((prev) => ({
                  ...prev,
                  maxDiscountPrice: e.target.value,
                }))
              }
            />
          </Stack>
          <Stack flexDirection="row" gap="10px">
            <StyledTextField
              placeholder="Total redeemable"
              value={coupon.totalRedemptions || ""}
              type="number"
              onChange={(e) =>
                setCoupon((prev) => ({
                  ...prev,
                  totalRedemptions: e.target.value,
                }))
              }
            />
            <StyledTextField
              placeholder="Total RedemptionsPerUser"
              value={coupon.totalRedemptionsPerUser || ""}
              type="number"
              onChange={(e) =>
                setCoupon((prev) => ({
                  ...prev,
                  totalRedemptionsPerUser: e.target.value,
                }))
              }
            />
          </Stack>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MultiInputDateRangeField
              value={dateRange}
              onChange={handleDateChange}
              sx={{
                "& .MuiInputBase-root": {
                  height: "40px",
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    border: "1px solid var(--sec-color)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    border: "1px solid var(--sec-color)",
                  },
                },
              }}
            />
          </LocalizationProvider>
        </Stack>
      </DialogContent>
    </DialogBox>
  );
};
