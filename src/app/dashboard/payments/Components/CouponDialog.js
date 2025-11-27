import {
  Button,
  IconButton,
  Stack,
  Typography,
  DialogContent,
  Grid,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
} from "@mui/material";
import {
  Close,
  East,
  LocalOffer,
  AttachMoney,
  People,
  Event,
} from "@mui/icons-material";
import { useState } from "react";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import SectionCard from "./SectionCard";
import Label from "./Label";
import LivePreview from "./LivePreview";

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
                    <Label required>Validity Period</Label>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <DatePicker
                            label="Start Date"
                            value={dayjs(coupon.startDate)}
                            onChange={(newValue) => {
                              setCoupon((prev) => ({
                                ...prev,
                                startDate: newValue ? newValue.valueOf() : null,
                              }));
                            }}
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
                        </Grid>
                        <Grid item xs={6}>
                          <DatePicker
                            label="End Date"
                            value={dayjs(coupon.endDate)}
                            onChange={(newValue) => {
                              setCoupon((prev) => ({
                                ...prev,
                                endDate: newValue ? newValue.valueOf() : null,
                              }));
                            }}
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
                        </Grid>
                      </Grid>
                    </LocalizationProvider>
                    <Typography
                      sx={{ fontSize: "10px", color: "var(--text3)", mt: 1 }}
                    >
                      Duration:{" "}
                      {coupon.endDate && coupon.startDate
                        ? dayjs(coupon.endDate).diff(
                            dayjs(coupon.startDate),
                            "day"
                          )
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

export default CouponDialog;
