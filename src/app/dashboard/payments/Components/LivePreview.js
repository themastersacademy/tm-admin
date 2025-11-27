import { Paper, Box, Stack, Typography } from "@mui/material";
import { LocalOffer } from "@mui/icons-material";
import dayjs from "dayjs";

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

export default LivePreview;
