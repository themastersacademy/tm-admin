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
  ToggleButton,
  ToggleButtonGroup,
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

  const createCoupon = async () => {
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
      showSnackbar("Please fill all the fields", "error");
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
      showSnackbar("Please fill all the fields", "error");
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
      const response = await apiFetch("/api/coupon/get-all");
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

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  return (
    <Stack gap="24px">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          backgroundColor: "#FFFFFF",
          padding: "16px 24px",
          borderRadius: "16px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
        }}
      >
        <Typography
          sx={{
            fontSize: "24px",
            fontWeight: 800,
            color: "var(--text1)",
            letterSpacing: "-0.5px",
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

const LivePreview = ({ coupon }) => {
  const discountText =
    coupon.discountType === "PERCENTAGE"
      ? `${coupon.discountValue || 0}% OFF`
      : `₹${coupon.discountValue || 0} OFF`;

  return (
    <Paper
      elevation={0}
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "16px",
        padding: "24px",
        color: "white",
        position: "relative",
        overflow: "hidden",
        border: "2px dashed rgba(255,255,255,0.3)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
        }}
      />
      <Stack gap={2} position="relative">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack>
            <Typography
              sx={{
                fontSize: "11px",
                opacity: 0.9,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {coupon.title || "Coupon Title"}
            </Typography>
            <Typography
              sx={{ fontSize: "32px", fontWeight: 800, lineHeight: 1.2 }}
            >
              {discountText}
            </Typography>
          </Stack>
          <LocalOffer sx={{ fontSize: "48px", opacity: 0.3 }} />
        </Stack>

        <Box
          sx={{
            background: "rgba(255,255,255,0.2)",
            padding: "10px 16px",
            borderRadius: "8px",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography sx={{ fontSize: "10px", opacity: 0.8, mb: 0.5 }}>
            CODE
          </Typography>
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 700,
              fontFamily: "monospace",
              letterSpacing: "2px",
            }}
          >
            {coupon.code || "YOURCODE"}
          </Typography>
        </Box>

        <Stack direction="row" gap={3} sx={{ fontSize: "11px", opacity: 0.9 }}>
          <Box>
            <Typography sx={{ fontSize: "9px", opacity: 0.7 }}>
              MIN ORDER
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>
              ₹{coupon.minOrderAmount || "0"}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: "9px", opacity: 0.7 }}>
              MAX SAVES
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>
              ₹{coupon.maxDiscountPrice || "0"}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: "9px", opacity: 0.7 }}>
              VALID TILL
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>
              {coupon.endDate ? dayjs(coupon.endDate).format("DD MMM") : "Date"}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
};

const SectionCard = ({ title, icon, children, helpText }) => (
  <Paper
    elevation={0}
    sx={{
      padding: "20px",
      borderRadius: "12px",
      border: "1px solid var(--border-color)",
      backgroundColor: "var(--bg-color)",
      transition: "all 0.2s ease",
      "&:hover": {
        borderColor: "var(--primary-color)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      },
    }}
  >
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      mb={2}
    >
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Box
          sx={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background:
              "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-dark) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {icon}
        </Box>
        <Stack>
          <Typography
            sx={{
              fontSize: "15px",
              fontWeight: 700,
              color: "var(--text1)",
            }}
          >
            {title}
          </Typography>
          {helpText && (
            <Typography sx={{ fontSize: "11px", color: "var(--text3)" }}>
              {helpText}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Stack>
    {children}
  </Paper>
);

const Label = ({ children, required, helpText }) => (
  <Stack direction="row" alignItems="center" gap={0.5} mb="6px">
    <Typography
      sx={{
        fontSize: "13px",
        fontWeight: 600,
        color: "var(--text1)",
      }}
    >
      {children}
    </Typography>
    {required && (
      <Typography sx={{ color: "red", fontSize: "13px" }}>*</Typography>
    )}
    {helpText && (
      <Tooltip title={helpText} arrow>
        <Box
          sx={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            backgroundColor: "var(--text3)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "9px",
            fontWeight: 700,
            cursor: "help",
          }}
        >
          ?
        </Box>
      </Tooltip>
    )}
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
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <LocalOffer sx={{ fontSize: "24px" }} />
          </Box>
          <Stack>
            <Typography
              sx={{ fontSize: "20px", fontWeight: 700, color: "var(--text1)" }}
            >
              {isEditMode ? "Edit Coupon" : "Create New Coupon"}
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "var(--text3)" }}>
              {isEditMode
                ? "Update coupon details and save changes"
                : "Fill in the details to create an amazing offer"}
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
          onClick={() => {
            isEditMode ? updateCoupon() : createCoupon();
          }}
          endIcon={<East />}
          sx={{
            background:
              "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-dark) 100%)",
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
            transition: "all 0.2s ease",
          }}
          disableElevation
          disabled={isLoading || !coupon.title}
        >
          {isEditMode ? "Update Coupon" : "Create Coupon"}
        </Button>
      }
    >
      <DialogContent sx={{ padding: "24px 32px" }}>
        <Grid container spacing={3}>
          {/* Left Column - Form */}
          <Grid item xs={12} lg={7}>
            <Stack gap={3}>
              {/* Basic Information */}
              <SectionCard
                title="Basic Information"
                helpText="Define your coupon name and code"
                icon={<LocalOffer sx={{ fontSize: "20px" }} />}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Label
                      required
                      helpText="This is the display name for your coupon"
                    >
                      Coupon Title
                    </Label>
                    <StyledTextField
                      placeholder="e.g., Summer Sale 2024 or New Year Special"
                      value={coupon.title || ""}
                      onChange={(e) =>
                        setCoupon((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Label required helpText="Unique code customers will use">
                      Coupon Code
                    </Label>
                    <StyledTextField
                      placeholder="e.g., SAVE50"
                      value={coupon.code || ""}
                      onChange={(e) =>
                        setCoupon((prev) => ({
                          ...prev,
                          code: e.target.value.toUpperCase(),
                        }))
                      }
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Label required helpText="Where this coupon can be used">
                      Applicable To
                    </Label>
                    <ToggleButtonGroup
                      value={coupon.couponClass || "ALL"}
                      exclusive
                      onChange={(e, value) => {
                        if (value) {
                          setCoupon((prev) => ({
                            ...prev,
                            couponClass: value,
                          }));
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
                      {goalOptions.map((option) => (
                        <ToggleButton key={option.id} value={option.id}>
                          {option.title}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Grid>
                </Grid>
              </SectionCard>

              {/* Discount Configuration */}
              <SectionCard
                title="Discount Configuration"
                helpText="Set discount value and limits"
                icon={<AttachMoney sx={{ fontSize: "20px" }} />}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Label required>Discount Type</Label>
                    <ToggleButtonGroup
                      value={coupon.discountType || "PERCENTAGE"}
                      exclusive
                      onChange={(e, value) => {
                        if (value) {
                          setCoupon((prev) => ({
                            ...prev,
                            discountType: value,
                          }));
                        }
                      }}
                      fullWidth
                      size="small"
                      sx={{
                        height: "40px",
                        mb: 1,
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
                      {discountTypeOptions.map((option) => (
                        <ToggleButton key={option.id} value={option.id}>
                          {option.title}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Label
                      required
                      helpText={
                        coupon.discountType === "PERCENTAGE"
                          ? "Max 100%"
                          : "Amount in rupees"
                      }
                    >
                      {coupon.discountType === "PERCENTAGE"
                        ? "Discount %"
                        : "Amount (₹)"}
                    </Label>
                    <StyledTextField
                      placeholder={
                        coupon.discountType === "PERCENTAGE" ? "10" : "500"
                      }
                      value={coupon.discountValue || ""}
                      type="number"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (
                          coupon.discountType === "PERCENTAGE" &&
                          value > 100
                        ) {
                          setCoupon((prev) => ({
                            ...prev,
                            discountValue: 100,
                          }));
                        } else {
                          setCoupon((prev) => ({
                            ...prev,
                            discountValue: value,
                          }));
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Label required helpText="Minimum cart value required">
                      Min Order (₹)
                    </Label>
                    <StyledTextField
                      placeholder="1000"
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
                  <Grid item xs={6} sm={4}>
                    <Label required helpText="Maximum discount cap">
                      Max Discount (₹)
                    </Label>
                    <StyledTextField
                      placeholder="200"
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

                {/* Info Box */}
                <Box
                  sx={{
                    mt: 2,
                    p: 1.5,
                    borderRadius: "8px",
                    backgroundColor: "#E3F2FD",
                    border: "1px solid #90CAF9",
                  }}
                >
                  <Typography
                    sx={{ fontSize: "11px", color: "#1976D2", lineHeight: 1.5 }}
                  >
                    💡 <strong>Example:</strong> If discount is 20% on ₹2000
                    order with max discount ₹300, customer saves ₹300 (capped),
                    not ₹400 (20% of ₹2000).
                  </Typography>
                </Box>
              </SectionCard>

              {/* Usage & Validity */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <SectionCard
                    title="Usage Limits"
                    helpText="Control redemption frequency"
                    icon={<People sx={{ fontSize: "20px" }} />}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Label
                          required
                          helpText="Total times this code can be used"
                        >
                          Total Uses
                        </Label>
                        <StyledTextField
                          placeholder="1000"
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
                      <Grid item xs={12}>
                        <Label required helpText="Uses per customer">
                          Per User Limit
                        </Label>
                        <StyledTextField
                          placeholder="1"
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
                </Grid>

                <Grid item xs={12} sm={6}>
                  <SectionCard
                    title="Validity Period"
                    helpText="When this offer is active"
                    icon={<Event sx={{ fontSize: "20px" }} />}
                  >
                    <Label required>Date Range</Label>
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
                    <Typography
                      sx={{ fontSize: "10px", color: "var(--text3)", mt: 1 }}
                    >
                      Duration:{" "}
                      {dateRange[1] && dateRange[0]
                        ? dateRange[1].diff(dateRange[0], "day")
                        : 0}{" "}
                      days
                    </Typography>
                  </SectionCard>
                </Grid>
              </Grid>
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
                <LivePreview coupon={coupon} />
              </Box>

              {/* Quick Stats */}
              <Paper
                elevation={0}
                sx={{
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-color)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 700,
                    mb: 1.5,
                    color: "var(--text1)",
                  }}
                >
                  📊 Coupon Stats
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "8px",
                        backgroundColor: "var(--white)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "10px",
                          color: "var(--text3)",
                          mb: 0.5,
                        }}
                      >
                        Customer Saves
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#4CAF50",
                        }}
                      >
                        ₹
                        {coupon.discountType === "PERCENTAGE" &&
                        coupon.minOrderAmount
                          ? Math.min(
                              (coupon.minOrderAmount * coupon.discountValue) /
                                100,
                              coupon.maxDiscountPrice || 0
                            ).toFixed(0)
                          : coupon.discountValue || "0"}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "8px",
                        backgroundColor: "var(--white)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "10px",
                          color: "var(--text3)",
                          mb: 0.5,
                        }}
                      >
                        Total Potential Uses
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#2196F3",
                        }}
                      >
                        {coupon.totalRedemptions || "0"}x
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Tips */}
              <Paper
                elevation={0}
                sx={{
                  padding: "16px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)",
                  border: "1px solid #FFB74D",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 700,
                    mb: 1,
                    color: "#E65100",
                  }}
                >
                  💡 Pro Tips
                </Typography>
                <Stack gap={0.5}>
                  <Typography
                    sx={{ fontSize: "11px", color: "#E65100", lineHeight: 1.5 }}
                  >
                    • Use clear, memorable codes like SAVE20
                  </Typography>
                  <Typography
                    sx={{ fontSize: "11px", color: "#E65100", lineHeight: 1.5 }}
                  >
                    • Set minimum order to ensure profitability
                  </Typography>
                  <Typography
                    sx={{ fontSize: "11px", color: "#E65100", lineHeight: 1.5 }}
                  >
                    • Limit per-user usage to prevent abuse
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
