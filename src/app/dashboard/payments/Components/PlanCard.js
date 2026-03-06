import {
  Card,
  Chip,
  Stack,
  Box,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import {
  LocalOffer,
  CalendarToday,
  Edit,
  Delete,
} from "@mui/icons-material";

const PlanCard = ({ plan, onEdit, onDelete }) => {
  const isYearly = plan.type === "YEARLY";

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        overflow: "hidden",
        transition: "all 0.15s ease",
        borderTop: `3px solid ${isYearly ? "#FF9800" : "var(--primary-color)"}`,
        "&:hover": {
          borderColor: isYearly ? "#FF9800" : "var(--primary-color)",
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack gap="2px">
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--text1)",
              }}
            >
              {plan.type === "MONTHLY" ? "Monthly Plan" : "Yearly Plan"}
            </Typography>
            <Stack direction="row" gap="4px" alignItems="center">
              <CalendarToday sx={{ fontSize: "11px", color: "var(--text4)" }} />
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--text3)",
                }}
              >
                {plan.duration} {plan.type === "MONTHLY" ? "Months" : "Years"}
              </Typography>
            </Stack>
          </Stack>

          {plan.discountInPercent > 0 && (
            <Chip
              icon={<LocalOffer sx={{ fontSize: "10px !important" }} />}
              label={`${plan.discountInPercent}% OFF`}
              size="small"
              sx={{
                height: "20px",
                fontSize: "10px",
                fontWeight: 700,
                backgroundColor: "rgba(76, 175, 80, 0.08)",
                color: "#4CAF50",
                border: "1px solid #4caf5030",
                "& .MuiChip-icon": { color: "#4CAF50" },
                "& .MuiChip-label": { padding: "0 6px" },
              }}
            />
          )}
        </Stack>

        <Divider sx={{ my: 1.5, borderStyle: "dashed" }} />

        {/* Price */}
        <Stack alignItems="center" gap="2px" py={1}>
          <Typography
            sx={{
              fontSize: "28px",
              fontWeight: 800,
              color: isYearly ? "#FF9800" : "var(--primary-color)",
              lineHeight: 1,
              fontFamily: "Lato",
            }}
          >
            ₹{plan.priceWithTax}
          </Typography>
          <Typography
            sx={{
              fontSize: "11px",
              color: "var(--text4)",
              fontWeight: 500,
            }}
          >
            per user / {isYearly ? "year" : "month"}
          </Typography>
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        {/* Actions */}
        <Stack direction="row" gap="8px">
          <Button
            variant="outlined"
            onClick={onEdit}
            fullWidth
            startIcon={<Edit sx={{ fontSize: "14px" }} />}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              borderColor: "var(--border-color)",
              color: "var(--text2)",
              fontWeight: 600,
              fontSize: "12px",
              height: "32px",
              "&:hover": {
                borderColor: "var(--primary-color)",
                backgroundColor: "var(--primary-color-acc-2)",
              },
            }}
          >
            Edit
          </Button>
          <Button
            onClick={onDelete}
            sx={{
              minWidth: "32px",
              padding: "6px",
              borderRadius: "8px",
              color: "#f44336",
              border: "1px solid #f4433630",
              "&:hover": {
                backgroundColor: "rgba(244, 67, 54, 0.04)",
                borderColor: "#f44336",
              },
            }}
          >
            <Delete sx={{ fontSize: "16px" }} />
          </Button>
        </Stack>
      </Box>
    </Card>
  );
};

export default PlanCard;
