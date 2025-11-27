import {
  Card,
  Chip,
  Stack,
  Box,
  Typography,
  Tooltip,
  IconButton,
  Button,
} from "@mui/material";
import {
  ContentCopy,
  Event,
  AttachMoney,
  Redeem,
  Edit,
  Delete,
} from "@mui/icons-material";
import dayjs from "dayjs";
import DetailItem from "./DetailItem";

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
        borderRadius: "16px",
        position: "relative",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "visible",
        backgroundColor: "transparent",
        "&:hover": {
          transform: "translateY(-4px)",
          "& .coupon-content": {
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
            borderColor: "var(--primary-color)",
          },
        },
      }}
    >
      <Box
        className="coupon-content"
        sx={{
          backgroundColor: "#fff",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          overflow: "hidden",
          transition: "all 0.3s ease",
          position: "relative",
        }}
      >
        {/* Status Chip */}
        <Chip
          label={isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
          size="small"
          sx={{
            position: "absolute",
            top: "12px",
            right: "12px",
            fontWeight: 700,
            fontSize: "11px",
            borderRadius: "6px",
            backgroundColor: isActive
              ? "rgba(46, 125, 50, 0.1)"
              : isExpired
              ? "rgba(198, 40, 40, 0.1)"
              : "rgba(0, 0, 0, 0.05)",
            color: isActive ? "#2E7D32" : isExpired ? "#C62828" : "#757575",
            zIndex: 2,
          }}
        />

        {/* Top Section - Value */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%)",
            p: "24px",
            pb: "32px",
            position: "relative",
            borderBottom: "2px dashed rgba(0,0,0,0.06)",
            "&::before, &::after": {
              content: '""',
              position: "absolute",
              bottom: "-10px",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "var(--bg-color)", // Matches page background
              zIndex: 1,
            },
            "&::before": { left: "-10px" },
            "&::after": { right: "-10px" },
          }}
        >
          <Stack gap="4px">
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--primary-color)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {coupon.title}
            </Typography>
            <Typography
              sx={{
                fontSize: "32px",
                fontWeight: 800,
                color: "#1A237E",
                lineHeight: 1,
                mt: 1,
              }}
            >
              {coupon.discountType === "PERCENTAGE"
                ? `${coupon.discountValue}%`
                : `₹${coupon.discountValue}`}
              <Box
                component="span"
                sx={{ fontSize: "16px", ml: 1, opacity: 0.7 }}
              >
                OFF
              </Box>
            </Typography>
          </Stack>
        </Box>

        {/* Bottom Section - Details */}
        <Box sx={{ p: "20px", pt: "24px" }}>
          {/* Code Section */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              backgroundColor: "#F8F9FA",
              border: "1px solid #E0E0E0",
              borderRadius: "8px",
              p: "8px 12px",
              mb: 2,
            }}
          >
            <Typography
              sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: "15px",
                color: "#333",
                letterSpacing: "1px",
              }}
            >
              {coupon.code}
            </Typography>
            <Tooltip title="Copy Code">
              <IconButton
                size="small"
                onClick={handleCopy}
                sx={{
                  color: "var(--primary-color)",
                  "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.04)" },
                }}
              >
                <ContentCopy sx={{ fontSize: "16px" }} />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Details List */}
          <Stack gap="10px" mb={2}>
            <DetailItem
              icon={<Event sx={{ fontSize: "16px" }} />}
              text={`${dayjs(coupon.startDate).format("DD MMM")} - ${dayjs(
                coupon.endDate
              ).format("DD MMM YYYY")}`}
            />
            <DetailItem
              icon={<AttachMoney sx={{ fontSize: "16px" }} />}
              text={`Min. Order: ₹${coupon.minOrderAmount}`}
            />
            <DetailItem
              icon={<Redeem sx={{ fontSize: "16px" }} />}
              text={`${coupon.totalRedemptions} / ${coupon.totalRedemptionsPerUser} used`}
            />
          </Stack>

          {/* Actions */}
          <Stack direction="row" gap="8px">
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={onEdit}
              fullWidth
              size="small"
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                borderColor: "#E0E0E0",
                color: "var(--text2)",
                "&:hover": {
                  borderColor: "var(--primary-color)",
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                },
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
                borderColor: "#E0E0E0",
                color: "#D32F2F",
                "&:hover": {
                  borderColor: "#D32F2F",
                  backgroundColor: "rgba(211, 47, 47, 0.04)",
                },
              }}
            >
              Delete
            </Button>
          </Stack>
        </Box>
      </Box>
    </Card>
  );
};

export default CouponCard;
