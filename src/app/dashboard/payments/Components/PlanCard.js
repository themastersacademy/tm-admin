import {
  Card,
  Chip,
  Stack,
  Box,
  Typography,
  Divider,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  LocalOffer,
  WorkspacePremium,
  CalendarToday,
  Edit,
  Delete,
  CheckCircle,
  Star,
} from "@mui/icons-material";

const PlanCard = ({ plan, onEdit, onDelete }) => {
  const isYearly = plan.type === "YEARLY";

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid var(--border-color)",
        borderRadius: "20px",
        padding: "0",
        position: "relative",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "visible",
        background: "var(--bg-color)",
        "&:hover": {
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
          transform: "translateY(-8px)",
          borderColor: "transparent",
          "&::before": {
            opacity: 1,
          },
        },
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "-2px",
          borderRadius: "22px",
          padding: "2px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          opacity: 0,
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
        },
      }}
    >
      {/* Best Value Badge for Yearly Plans */}
      {isYearly && (
        <Box
          sx={{
            position: "absolute",
            top: "-12px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(90deg, #FF9800 0%, #F57C00 100%)",
            color: "white",
            padding: "4px 12px",
            borderRadius: "12px",
            fontSize: "11px",
            fontWeight: 700,
            boxShadow: "0 4px 10px rgba(245, 124, 0, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            zIndex: 2,
          }}
        >
          <Star sx={{ fontSize: "14px" }} /> BEST VALUE
        </Box>
      )}

      <Box sx={{ p: 3 }}>
        {/* Header Section */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="start"
        >
          <Stack gap={0.5}>
            <Typography
              sx={{
                fontSize: "18px",
                fontWeight: 800,
                color: "var(--text1)",
                letterSpacing: "-0.5px",
              }}
            >
              {plan.type === "MONTHLY" ? "Monthly Plan" : "Yearly Plan"}
            </Typography>
            <Stack direction="row" gap="6px" alignItems="center">
              <Box
                sx={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "6px",
                  bgcolor: isYearly ? "#FFF3E0" : "#E3F2FD",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isYearly ? "#F57C00" : "#1976D2",
                }}
              >
                <CalendarToday sx={{ fontSize: "14px" }} />
              </Box>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text2)",
                }}
              >
                {plan.duration} {plan.type === "MONTHLY" ? "Months" : "Years"}
              </Typography>
            </Stack>
          </Stack>

          {plan.discountInPercent > 0 && (
            <Chip
              icon={<LocalOffer sx={{ fontSize: "12px !important" }} />}
              label={`${plan.discountInPercent}% OFF`}
              size="small"
              sx={{
                backgroundColor: "#E8F5E9",
                color: "#2E7D32",
                fontWeight: 700,
                fontSize: "11px",
                height: "24px",
                "& .MuiChip-icon": { color: "#2E7D32" },
              }}
            />
          )}
        </Stack>

        <Divider sx={{ my: 2.5, borderStyle: "dashed" }} />

        {/* Price Section */}
        <Stack alignItems="center" gap={0.5}>
          <Typography
            sx={{
              fontSize: "36px",
              fontWeight: 800,
              color: "var(--text1)",
              lineHeight: 1,
              background: isYearly
                ? "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)"
                : "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ₹{plan.priceWithTax}
          </Typography>
          <Typography
            sx={{
              fontSize: "12px",
              color: "var(--text3)",
              fontWeight: 500,
            }}
          >
            per user / {isYearly ? "year" : "month"}
          </Typography>
        </Stack>

        {/* Features List (Mock) */}
        <Stack gap={1.5} mt={3} mb={3}>
          {[
            "Full Access to Dashboard",
            "Priority Support",
            isYearly ? "Save 20% vs Monthly" : "Cancel Anytime",
          ].map((feature, index) => (
            <Stack key={index} direction="row" gap="8px" alignItems="center">
              <CheckCircle
                sx={{ fontSize: "16px", color: "var(--primary-color)" }}
              />
              <Typography sx={{ fontSize: "13px", color: "var(--text2)" }}>
                {feature}
              </Typography>
            </Stack>
          ))}
        </Stack>

        {/* Actions */}
        <Stack direction="row" gap={1.5}>
          <Button
            variant="outlined"
            onClick={onEdit}
            fullWidth
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              borderColor: "var(--border-color)",
              color: "var(--text1)",
              fontWeight: 600,
              "&:hover": {
                borderColor: "var(--text1)",
                backgroundColor: "transparent",
              },
            }}
          >
            Edit
          </Button>
          <Button
            onClick={onDelete}
            sx={{
              minWidth: "44px",
              padding: "8px",
              borderRadius: "10px",
              color: "var(--delete-color)",
              backgroundColor: "#FFEBEE",
              "&:hover": {
                backgroundColor: "#FFCDD2",
              },
            }}
          >
            <Delete sx={{ fontSize: "20px" }} />
          </Button>
        </Stack>
      </Box>
    </Card>
  );
};

export default PlanCard;
