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

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(coupon.code);
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "10px",
        border: "1px solid var(--border-color)",
        overflow: "hidden",
        transition: "all 0.15s ease",
        borderLeft: `3px solid ${isActive ? "var(--primary-color)" : isExpired ? "#f44336" : "var(--border-color)"}`,
        "&:hover": {
          borderColor: "var(--primary-color)",
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={1}
        >
          <Stack gap="2px" flex={1} mr={1}>
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--text1)",
                lineHeight: 1.2,
              }}
            >
              {coupon.title}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              gap="4px"
              sx={{
                backgroundColor: "var(--primary-color-acc-2)",
                borderRadius: "4px",
                px: "6px",
                py: "2px",
                width: "fit-content",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--primary-color)",
                }}
              >
                {coupon.code}
              </Typography>
              <IconButton
                size="small"
                onClick={handleCopy}
                sx={{ p: 0.25 }}
              >
                <ContentCopy sx={{ fontSize: "10px", color: "var(--primary-color)" }} />
              </IconButton>
            </Stack>
          </Stack>

          <Stack direction="row" alignItems="center" gap="4px">
            <Chip
              label={isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
              size="small"
              sx={{
                height: "20px",
                fontSize: "10px",
                fontWeight: 700,
                backgroundColor: isActive
                  ? "rgba(76, 175, 80, 0.08)"
                  : isExpired
                  ? "rgba(244, 67, 54, 0.08)"
                  : "rgba(0, 0, 0, 0.04)",
                color: isActive ? "#4CAF50" : isExpired ? "#f44336" : "#757575",
                border: `1px solid ${isActive ? "#4caf5030" : isExpired ? "#f4433630" : "#00000015"}`,
                "& .MuiChip-label": { padding: "0 6px" },
              }}
            />
            <Chip
              label={
                coupon.discountType === "PERCENTAGE"
                  ? `${coupon.discountValue}%`
                  : `₹${coupon.discountValue}`
              }
              size="small"
              sx={{
                height: "20px",
                fontSize: "10px",
                fontWeight: 700,
                backgroundColor: "rgba(156, 39, 176, 0.08)",
                color: "#9C27B0",
                border: "1px solid #9C27B030",
                "& .MuiChip-label": { padding: "0 6px" },
              }}
            />
          </Stack>
        </Stack>

        {/* Info Row */}
        <Stack direction="row" gap="16px" mb={1}>
          <Stack>
            <Typography sx={{ fontSize: "9px", color: "var(--text4)", textTransform: "uppercase" }}>
              Valid
            </Typography>
            <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "var(--text2)" }}>
              {dayjs(coupon.startDate).format("DD MMM")} - {dayjs(coupon.endDate).format("DD MMM YY")}
            </Typography>
          </Stack>
          <Stack>
            <Typography sx={{ fontSize: "9px", color: "var(--text4)", textTransform: "uppercase" }}>
              Min. Order
            </Typography>
            <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "var(--text2)" }}>
              ₹{coupon.minOrderAmount}
            </Typography>
          </Stack>
          <Stack>
            <Typography sx={{ fontSize: "9px", color: "var(--text4)", textTransform: "uppercase" }}>
              Limit
            </Typography>
            <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "var(--text2)" }}>
              {coupon.totalRedemptions}/{coupon.totalRedemptionsPerUser}
            </Typography>
          </Stack>
        </Stack>

        <Divider sx={{ my: 1 }} />

        {/* Stats + Actions */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" gap="12px">
            <Stack direction="row" alignItems="center" gap="4px">
              <TrendingUp sx={{ fontSize: "12px", color: "#2196F3" }} />
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#2196F3" }}>
                {coupon.redemptionCount || 0}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap="4px">
              <Savings sx={{ fontSize: "12px", color: "#FF9800" }} />
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#FF9800" }}>
                ₹{coupon.totalDiscountGiven || 0}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap="4px">
              <ShoppingCart sx={{ fontSize: "12px", color: "#4CAF50" }} />
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#4CAF50" }}>
                ₹{coupon.totalSalesWithCoupon || 0}
              </Typography>
            </Stack>
          </Stack>

          <Stack direction="row" gap="4px">
            <IconButton
              onClick={onEdit}
              size="small"
              sx={{
                width: 28,
                height: 28,
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                "&:hover": {
                  borderColor: "var(--primary-color)",
                  backgroundColor: "var(--primary-color-acc-2)",
                },
              }}
            >
              <Edit sx={{ fontSize: "14px", color: "var(--primary-color)" }} />
            </IconButton>
            <IconButton
              onClick={onDelete}
              size="small"
              sx={{
                width: 28,
                height: 28,
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                "&:hover": {
                  borderColor: "#f44336",
                  backgroundColor: "rgba(244, 67, 54, 0.04)",
                },
              }}
            >
              <Delete sx={{ fontSize: "14px", color: "#f44336" }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
};

export default CouponCard;
