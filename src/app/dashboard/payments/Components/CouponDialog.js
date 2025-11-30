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
  Autocomplete,
  Chip,
  Avatar,
  ListItemText,
  ListItemAvatar,
  MenuItem,
} from "@mui/material";
import {
  Close,
  East,
  LocalOffer,
  AttachMoney,
  People,
  Event,
  CheckBoxOutlineBlank,
  CheckBox,
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
  courses,
  goals,
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
            "&.Mui-disabled": {
              background: "#E0E0E0",
              color: "#9E9E9E",
              boxShadow: "none",
            },
            transition: "all 0.2s ease",
          }}
          disableElevation
          disabled={
            isLoading ||
            !coupon.title ||
            !coupon.code ||
            !coupon.discountValue ||
            !coupon.startDate ||
            !coupon.endDate
          }
        >
          {isEditMode ? "Update Coupon" : "Create Coupon"}
        </Button>
      }
    >
      <DialogContent sx={{ padding: "24px 32px" }}>
        <Grid container spacing={3}>
          {/* Left Column - Form */}
          <Grid item xs={12} lg={7}>
            <Stack gap={2.5}>
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
                            applicableCourses: [],
                            applicableGoals: [],
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

                  {/* Specific Selection */}
                  {coupon.couponClass === "COURSES" && (
                    <Grid item xs={12}>
                      <Label required helpText="Select applicable courses">
                        Select Courses
                      </Label>
                      <Box
                        sx={{
                          border: "1px solid var(--border-color)",
                          borderRadius: "5px",
                          maxHeight: "300px",
                          overflow: "auto",
                          "&:hover": {
                            borderColor: "var(--primary-color)",
                          },
                        }}
                      >
                        {(courses || []).map((course) => {
                          const isSelected = coupon.applicableCourses?.includes(
                            course.courseID
                          );
                          return (
                            <Box
                              key={course.courseID}
                              onClick={() => {
                                setCoupon((prev) => {
                                  const currentCourses =
                                    prev.applicableCourses || [];
                                  const newCourses = isSelected
                                    ? currentCourses.filter(
                                        (id) => id !== course.courseID
                                      )
                                    : [...currentCourses, course.courseID];
                                  return {
                                    ...prev,
                                    applicableCourses: newCourses,
                                  };
                                });
                              }}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                p: 1.5,
                                cursor: "pointer",
                                borderBottom: "1px solid var(--border-color)",
                                transition: "background-color 0.2s",
                                "&:last-child": {
                                  borderBottom: "none",
                                },
                                "&:hover": {
                                  backgroundColor: "rgba(0,0,0,0.02)",
                                },
                                backgroundColor: isSelected
                                  ? "rgba(25, 118, 210, 0.04)"
                                  : "transparent",
                              }}
                            >
                              {isSelected ? (
                                <CheckBox
                                  color="primary"
                                  sx={{ fontSize: "20px" }}
                                />
                              ) : (
                                <CheckBoxOutlineBlank
                                  color="action"
                                  sx={{ fontSize: "20px" }}
                                />
                              )}
                              <Avatar
                                src={course.thumbnail}
                                variant="rounded"
                                sx={{ width: 40, height: 40 }}
                              >
                                {course.title?.charAt(0)}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  sx={{
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    color: "var(--text1)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {course.title}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: "12px",
                                    color: "var(--text3)",
                                  }}
                                >
                                  {course.price ? `₹${course.price}` : "Free"}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                        {(!courses || courses.length === 0) && (
                          <Box sx={{ p: 3, textAlign: "center" }}>
                            <Typography
                              sx={{ fontSize: "14px", color: "var(--text3)" }}
                            >
                              No courses available
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      {coupon.applicableCourses?.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography
                            sx={{
                              fontSize: "12px",
                              color: "var(--text3)",
                              mb: 0.5,
                            }}
                          >
                            Selected: {coupon.applicableCourses.length} course
                            {coupon.applicableCourses.length !== 1 ? "s" : ""}
                          </Typography>
                          <Stack direction="row" gap={0.5} flexWrap="wrap">
                            {coupon.applicableCourses.map((courseId) => {
                              const course = courses?.find(
                                (c) => c.courseID === courseId
                              );
                              return course ? (
                                <Chip
                                  key={courseId}
                                  label={course.title}
                                  size="small"
                                  variant="outlined"
                                  onDelete={() => {
                                    setCoupon((prev) => ({
                                      ...prev,
                                      applicableCourses:
                                        prev.applicableCourses.filter(
                                          (id) => id !== courseId
                                        ),
                                    }));
                                  }}
                                  sx={{ fontSize: "12px" }}
                                />
                              ) : null;
                            })}
                          </Stack>
                        </Box>
                      )}
                    </Grid>
                  )}
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
                  <Grid item xs={12} sm={4}>
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
                  <Grid item xs={12} sm={4}>
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
                  {coupon.discountType === "PERCENTAGE" && (
                    <Grid item xs={12} sm={4}>
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
                  )}
                </Grid>
              </SectionCard>

              {/* Usage & Validity */}
              <SectionCard
                title="Usage & Validity"
                helpText="Control limits and active period"
                icon={<People sx={{ fontSize: "20px" }} />}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Label required helpText="Total times code can be used">
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
                  <Grid item xs={12} sm={6} md={3}>
                    <Label required helpText="Uses per customer">
                      Per User
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
                  <Grid item xs={12} sm={6} md={3}>
                    <Label required>Start Date</Label>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
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
                            placeholder: "Select date",
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Label required>End Date</Label>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
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
                            placeholder: "Select date",
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography
                      sx={{ fontSize: "11px", color: "var(--text3)" }}
                    >
                      Duration:{" "}
                      <strong>
                        {coupon.endDate && coupon.startDate
                          ? dayjs(coupon.endDate).diff(
                              dayjs(coupon.startDate),
                              "day"
                            )
                          : 0}{" "}
                        days
                      </strong>
                    </Typography>
                  </Grid>
                </Grid>
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
                <LivePreview coupon={coupon} />
              </Box>

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
