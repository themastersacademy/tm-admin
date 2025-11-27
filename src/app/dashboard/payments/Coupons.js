"use client";
import SearchBox from "@/src/components/SearchBox/SearchBox";
import {
  Add,
  Close,
  Delete,
  East,
  Edit,
  LocalOffer,
  ContentCopy,
  Event,
  AttachMoney,
  People,
  Redeem,
} from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  Grid,
  Card,
  Chip,
  Box,
  Divider,
  Tooltip,
  Paper,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import StyledSelect from "@/src/components/StyledSelect/StyledSelect";
import { apiFetch } from "@/src/lib/apiFetch";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { MultiInputDateRangeField } from "@mui/x-date-pickers-pro/MultiInputDateRangeField";
import { useSnackbar } from "../../context/SnackbarContext";
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

  const dialogDeleteOpen = (coupon) => {
    setSelectedCoupon(coupon);
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

  const fetchCoupons = useCallback(() => {
    setIsLoading(true);
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/coupon/get-all`).then(
      (data) => {
        if (data.success) {
          setCoupons(data.data);
        }
        setIsLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

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
            c.id === selectedCoupon.id ? { ...c, ...updatedCoupon } : c
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
  }, [selectedCoupon, showSnackbar, fetchCoupons]);

  const handleDelete = useCallback(async () => {
    try {
      await apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/coupon/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: selectedCoupon?.id }),
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
    <Stack gap="20px" padding="20px">
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography
          sx={{
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--text1)",
          }}
        >
          Coupons & Offers
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
          Create Coupon
        </Button>
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

const CouponCard = ({ coupon, onEdit, onDelete }) => {
  const isExpired = dayjs().isAfter(dayjs(coupon.endDate));
  const isActive = coupon.isActive && !isExpired;

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid var(--border-color)",
        borderRadius: "16px",
        padding: "20px",
        position: "relative",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 12px 24px rgba(0,0,0,0.05)",
          transform: "translateY(-4px)",
          borderColor: "var(--primary-color)",
        },
        opacity: isActive ? 1 : 0.7,
      }}
    >
      <Chip
        label={isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
        size="small"
        color={isActive ? "success" : "default"}
        sx={{
          position: "absolute",
          top: "16px",
          right: "16px",
          fontWeight: 600,
          borderRadius: "6px",
        }}
      />

      <Stack gap="16px">
        <Stack direction="row" gap="16px" alignItems="center">
          <Box
            sx={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              backgroundColor: "var(--primary-color-acc-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary-color)",
            }}
          >
            <LocalOffer sx={{ fontSize: "28px" }} />
          </Box>
          <Stack>
            <Typography
              sx={{
                fontSize: "14px",
                color: "var(--text3)",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              {coupon.title}
            </Typography>
            <Typography
              sx={{ fontSize: "24px", fontWeight: 800, color: "var(--text1)" }}
            >
              {coupon.discountType === "PERCENTAGE"
                ? `${coupon.discountValue}% OFF`
                : `₹${coupon.discountValue} OFF`}
            </Typography>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            backgroundColor: "#F5F5F5",
            padding: "12px",
            borderRadius: "8px",
            border: "1px dashed var(--text3)",
          }}
        >
          <Typography
            sx={{
              fontFamily: "monospace",
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--text1)",
            }}
          >
            {coupon.code}
          </Typography>
          <Tooltip title="Copy Code">
            <IconButton size="small" onClick={handleCopy}>
              <ContentCopy sx={{ fontSize: "16px" }} />
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack gap="8px">
          <DetailItem
            icon={<Event />}
            text={`${dayjs(coupon.startDate).format("DD MMM")} - ${dayjs(
              coupon.endDate
            ).format("DD MMM YYYY")}`}
          />
          <DetailItem
            icon={<AttachMoney />}
            text={`Min. Order: ₹${coupon.minOrderAmount}`}
          />
          <DetailItem
            icon={<Redeem />}
            text={`${coupon.totalRedemptions} Total / ${coupon.totalRedemptionsPerUser} Per User`}
          />
        </Stack>

        <Divider />

        <Stack direction="row" gap="12px">
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={onEdit}
            fullWidth
            size="small"
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
            size="small"
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              borderColor: "var(--delete-color)",
              color: "var(--delete-color)",
            }}
          >
            Delete
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
};

const DetailItem = ({ icon, text }) => (
  <Stack direction="row" gap="8px" alignItems="center">
    <Box sx={{ color: "var(--text3)", display: "flex" }}>
      {icon && <icon.type sx={{ fontSize: "16px" }} />}
    </Box>
    <Typography sx={{ fontSize: "13px", color: "var(--text2)" }}>
      {text}
    </Typography>
  </Stack>
);

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
    coupon.startDate ? dayjs(coupon.startDate) : defaultStartDate,
    coupon.endDate ? dayjs(coupon.endDate) : defaultEndDate,
  ]);

  const handleDateChange = (newDateRange) => {
    const [startDate, endDate] = newDateRange;
    setDateRange(newDateRange);
    setCoupon((prev) => ({
      ...prev,
      startDate: startDate ? startDate.valueOf() : null,
      endDate: endDate ? endDate.valueOf() : null,
    }));
  };

  const SectionCard = ({ title, icon, children }) => (
    <Paper
      elevation={0}
      sx={{
        padding: "20px",
        borderRadius: "12px",
        border: "1px solid var(--border-color)",
        backgroundColor: "var(--bg-color)", // Subtle background
      }}
    >
      <Stack direction="row" alignItems="center" gap="10px" mb={2}>
        <Box
          sx={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            backgroundColor: "var(--white)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          {icon}
        </Box>
        <Typography
          sx={{
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--text1)",
          }}
        >
          {title}
        </Typography>
      </Stack>
      {children}
    </Paper>
  );

  const Label = ({ children }) => (
    <Typography
      sx={{
        fontSize: "13px",
        fontWeight: 600,
        color: "var(--text1)",
        mb: "6px",
      }}
    >
      {children}
    </Typography>
  );

  return (
    <DialogBox
      isOpen={isDialogOpen}
      title={isEditMode ? "Edit Coupon" : "Create New Coupon"}
      customWidth="850px"
      icon={
        <IconButton
          onClick={dialogClose}
          sx={{
            borderRadius: "8px",
            padding: "8px",
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
          onClick={() => {
            isEditMode ? updateCoupon() : createCoupon();
          }}
          endIcon={<East />}
          sx={{
            backgroundColor: "var(--primary-color)",
            color: "#FFFFFF",
            textTransform: "none",
            borderRadius: "10px",
            padding: "12px 32px",
            fontWeight: 700,
            fontSize: "15px",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
            "&:hover": {
              backgroundColor: "var(--primary-color-dark, #1565C0)", // Fallback if var not defined
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
              transform: "translateY(-1px)",
            },
            transition: "all 0.2s ease",
          }}
          disableElevation
          disabled={isLoading || !coupon.title}
        >
          {isEditMode ? "Update Coupon" : "Create Coupon"}
        </Button>
      }
    >
      <DialogContent sx={{ padding: "24px" }}>
        <Stack gap="24px">
          {/* Top Row: Basic Info & Validity */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <SectionCard
                title="Basic Information"
                icon={
                  <LocalOffer
                    sx={{ fontSize: "18px", color: "var(--primary-color)" }}
                  />
                }
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Label>Coupon Title</Label>
                    <StyledTextField
                      placeholder="e.g., Summer Sale 2024"
                      value={coupon.title || ""}
                      onChange={(e) =>
                        setCoupon((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Label>Coupon Code</Label>
                    <StyledTextField
                      placeholder="e.g., SUMMER50"
                      value={coupon.code || ""}
                      onChange={(e) =>
                        setCoupon((prev) => ({
                          ...prev,
                          code: e.target.value.toUpperCase(),
                        }))
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Label>Applicable To</Label>
                    <StyledSelect
                      value={coupon.couponClass || ""}
                      onChange={(e) =>
                        setCoupon((prev) => ({
                          ...prev,
                          couponClass: e.target.value,
                        }))
                      }
                      options={goalOptions}
                    />
                  </Grid>
                </Grid>
              </SectionCard>
            </Grid>

            <Grid item xs={12} md={5}>
              <SectionCard
                title="Validity Period"
                icon={
                  <Event
                    sx={{ fontSize: "18px", color: "var(--primary-color)" }}
                  />
                }
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Label>Date Range</Label>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <MultiInputDateRangeField
                        value={dateRange}
                        onChange={handleDateChange}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            sx: {
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "8px",
                                backgroundColor: "var(--white)",
                              },
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                </Grid>
              </SectionCard>
            </Grid>
          </Grid>

          {/* Middle Row: Discount Rules */}
          <SectionCard
            title="Discount Rules"
            icon={
              <AttachMoney
                sx={{ fontSize: "18px", color: "var(--primary-color)" }}
              />
            }
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Label>Discount Type</Label>
                <StyledSelect
                  value={coupon.discountType || ""}
                  onChange={(e) =>
                    setCoupon((prev) => ({
                      ...prev,
                      discountType: e.target.value,
                    }))
                  }
                  options={discountTypeOptions}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Label>
                  {coupon.discountType === "PERCENTAGE"
                    ? "Value (%)"
                    : "Amount (₹)"}
                </Label>
                <StyledTextField
                  placeholder={
                    coupon.discountType === "PERCENTAGE"
                      ? "e.g., 20"
                      : "e.g., 500"
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
              </Grid>
              <Grid item xs={12} sm={3}>
                <Label>Min Order (₹)</Label>
                <StyledTextField
                  placeholder="e.g., 1000"
                  value={coupon.minOrderAmount || ""}
                  type="number"
                  onChange={(e) =>
                    setCoupon((prev) => ({
                      ...prev,
                      minOrderAmount: e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Label>Max Discount (₹)</Label>
                <StyledTextField
                  placeholder="e.g., 200"
                  value={coupon.maxDiscountPrice || ""}
                  type="number"
                  onChange={(e) =>
                    setCoupon((prev) => ({
                      ...prev,
                      maxDiscountPrice: e.target.value,
                    }))
                  }
                />
              </Grid>
            </Grid>
          </SectionCard>

          {/* Bottom Row: Usage Limits */}
          <SectionCard
            title="Usage Limits"
            icon={
              <People
                sx={{ fontSize: "18px", color: "var(--primary-color)" }}
              />
            }
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Label>Total Redemptions</Label>
                <StyledTextField
                  placeholder="e.g., 1000"
                  value={coupon.totalRedemptions || ""}
                  type="number"
                  onChange={(e) =>
                    setCoupon((prev) => ({
                      ...prev,
                      totalRedemptions: e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Label>Redemptions Per User</Label>
                <StyledTextField
                  placeholder="e.g., 1"
                  value={coupon.totalRedemptionsPerUser || ""}
                  type="number"
                  onChange={(e) =>
                    setCoupon((prev) => ({
                      ...prev,
                      totalRedemptionsPerUser: e.target.value,
                    }))
                  }
                />
              </Grid>
            </Grid>
          </SectionCard>
        </Stack>
      </DialogContent>
    </DialogBox>
  );
};
