import {
  Card,
  Chip,
  Stack,
  Box,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import {
  ContentCopy,
  Edit,
  Delete,
  TrendingUp,
  Savings,
  ShoppingCart,
} from "@mui/icons-material";
import dayjs from "dayjs";

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
        borderRadius: "12px",
        border: "1px solid var(--border-color)",
        overflow: "hidden",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          borderColor: "var(--primary-color)",
        },
      }}
    >
      {/* Main Content */}
      <Stack direction="row" sx={{ height: "100%" }}>
        {/* Left Side - Discount Badge */}
        <Box
          sx={{
            width: "120px",
            background: isActive
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              : "linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            p: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: "11px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.9)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              mb: 0.5,
            }}
          >
            Save
          </Typography>
          <Typography
            sx={{
              fontSize: "32px",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1,
            }}
          >
            {coupon.discountType === "PERCENTAGE"
              ? `${coupon.discountValue}%`
              : `₹${coupon.discountValue}`}
          </Typography>
          <Typography
            sx={{
              fontSize: "10px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.8)",
              mt: 0.5,
            }}
          >
            {coupon.discountType === "PERCENTAGE" ? "OFF" : "FLAT"}
          </Typography>
        </Box>

        {/* Right Side - Information */}
        <Box sx={{ flex: 1, p: 2 }}>
          {/* Header Row */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={1.5}
          >
            <Box sx={{ flex: 1, mr: 1 }}>
              <Typography
                sx={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "var(--text1)",
                  mb: 0.5,
                  lineHeight: 1.2,
                }}
              >
                {coupon.title}
              </Typography>
              <Stack
                direction="row"
                alignItems="center"
                gap={0.5}
                sx={{
                  backgroundColor: "#F5F5F5",
                  borderRadius: "4px",
                  px: 1,
                  py: 0.5,
                  width: "fit-content",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--text2)",
                  }}
                >
                  {coupon.code}
                </Typography>
                <IconButton
                  size="small"
                  onClick={handleCopy}
                  sx={{
                    p: 0.25,
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.05)" },
                  }}
                >
                  <ContentCopy sx={{ fontSize: "12px" }} />
                </IconButton>
              </Stack>
            </Box>
            <Chip
              label={isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
              size="small"
              sx={{
                height: "20px",
                fontSize: "10px",
                fontWeight: 700,
                backgroundColor: isActive
                  ? "rgba(46, 125, 50, 0.1)"
                  : isExpired
                  ? "rgba(198, 40, 40, 0.1)"
                  : "rgba(0, 0, 0, 0.05)",
                color: isActive ? "#2E7D32" : isExpired ? "#C62828" : "#757575",
              }}
            />
          </Stack>

          {/* Info Grid */}
          <Stack direction="row" gap={2} mb={1.5}>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: "9px",
                  color: "var(--text3)",
                  textTransform: "uppercase",
                  mb: 0.25,
                }}
              >
                Valid Period
              </Typography>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--text2)",
                }}
              >
                {dayjs(coupon.startDate).format("DD MMM")} -{" "}
                {dayjs(coupon.endDate).format("DD MMM YY")}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: "9px",
                  color: "var(--text3)",
                  textTransform: "uppercase",
                  mb: 0.25,
                }}
              >
                Min. Order
              </Typography>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--text2)",
                }}
              >
                ₹{coupon.minOrderAmount}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: "9px",
                  color: "var(--text3)",
                  textTransform: "uppercase",
                  mb: 0.25,
                }}
              >
                Usage Limit
              </Typography>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--text2)",
                }}
              >
                {coupon.totalRedemptions} / {coupon.totalRedemptionsPerUser}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* Analytics Row */}
          <Stack direction="row" gap={1.5} mb={1.5}>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 0.75,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "6px",
                  backgroundColor: "rgba(33, 150, 243, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrendingUp sx={{ fontSize: "16px", color: "#2196F3" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: "9px",
                    color: "var(--text3)",
                    lineHeight: 1,
                  }}
                >
                  Uses
                </Typography>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#2196F3",
                    lineHeight: 1.2,
                  }}
                >
                  {coupon.redemptionCount || "0"}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 0.75,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "6px",
                  backgroundColor: "rgba(255, 152, 0, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Savings sx={{ fontSize: "16px", color: "#FF9800" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: "9px",
                    color: "var(--text3)",
                    lineHeight: 1,
                  }}
                >
                  Saved
                </Typography>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#FF9800",
                    lineHeight: 1.2,
                  }}
                >
                  ₹{coupon.totalDiscountGiven || "0"}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 0.75,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "6px",
                  backgroundColor: "rgba(76, 175, 80, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShoppingCart sx={{ fontSize: "16px", color: "#4CAF50" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: "9px",
                    color: "var(--text3)",
                    lineHeight: 1,
                  }}
                >
                  Sales
                </Typography>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#4CAF50",
                    lineHeight: 1.2,
                  }}
                >
                  ₹{coupon.totalSalesWithCoupon || "0"}
                </Typography>
              </Box>
            </Box>
          </Stack>

          {/* Actions */}
          <Stack direction="row" gap={1}>
            <IconButton
              onClick={onEdit}
              size="small"
              sx={{
                flex: 1,
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                "&:hover": {
                  borderColor: "var(--primary-color)",
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                },
              }}
            >
              <Edit sx={{ fontSize: "16px", color: "var(--primary-color)" }} />
            </IconButton>
            <IconButton
              onClick={onDelete}
              size="small"
              sx={{
                flex: 1,
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                "&:hover": {
                  borderColor: "#D32F2F",
                  backgroundColor: "rgba(211, 47, 47, 0.04)",
                },
              }}
            >
              <Delete sx={{ fontSize: "16px", color: "#D32F2F" }} />
            </IconButton>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
};

export default CouponCard;
