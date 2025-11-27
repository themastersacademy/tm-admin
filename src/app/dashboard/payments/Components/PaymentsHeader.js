"use client";
import { Stack, Typography, Grid, Box } from "@mui/material";
import {
  CurrencyRupee,
  WorkspacePremium,
  LocalOffer,
  TrendingUp,
} from "@mui/icons-material";

export default function PaymentsHeader({ stats = {} }) {
  const {
    totalRevenue = 0,
    activePlans = 0,
    totalCoupons = 0,
    monthlyGrowth = 0,
  } = stats;

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      icon: CurrencyRupee,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      bgGradient:
        "linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.06) 100%)",
      borderColor: "rgba(102, 126, 234, 0.3)",
    },
    {
      title: "Active Plans",
      value: activePlans.toString(),
      icon: WorkspacePremium,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      bgGradient:
        "linear-gradient(135deg, rgba(240, 147, 251, 0.12) 0%, rgba(245, 87, 108, 0.06) 100%)",
      borderColor: "rgba(240, 147, 251, 0.3)",
    },
    {
      title: "Total Coupons",
      value: totalCoupons.toString(),
      icon: LocalOffer,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      bgGradient:
        "linear-gradient(135deg, rgba(79, 172, 254, 0.12) 0%, rgba(0, 242, 254, 0.06) 100%)",
      borderColor: "rgba(79, 172, 254, 0.3)",
    },
    {
      title: "Monthly Growth",
      value: `${monthlyGrowth >= 0 ? "+" : ""}${monthlyGrowth}%`,
      icon: TrendingUp,
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      bgGradient:
        "linear-gradient(135deg, rgba(67, 233, 123, 0.12) 0%, rgba(56, 249, 215, 0.06) 100%)",
      borderColor: "rgba(67, 233, 123, 0.3)",
    },
  ];

  return (
    <Stack
      sx={{
        background: "linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)",
        borderRadius: "12px",
        padding: "24px",
        border: "1px solid var(--border-color)",
      }}
    >
      {/* Header Title */}
      <Stack gap="8px" mb={3}>
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--text1)",
          }}
        >
          Revenue Management
        </Typography>
        <Typography
          sx={{
            fontSize: "14px",
            color: "var(--text3)",
            fontWeight: 400,
          }}
        >
          Monitor transactions, manage subscription plans, and track promotional
          offers
        </Typography>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={2}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Stack
              sx={{
                background: "var(--white)",
                border: `1px solid ${stat.borderColor}`,
                borderRadius: "12px",
                padding: "20px",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
                  borderColor: stat.borderColor.replace("0.3", "0.5"),
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: stat.gradient,
                },
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Stack gap="8px">
                  <Typography
                    sx={{
                      fontSize: "13px",
                      color: "var(--text3)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {stat.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "28px",
                      fontWeight: 700,
                      color: "var(--text1)",
                      fontFamily: "Lato",
                    }}
                  >
                    {stat.value}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    width: "48px",
                    height: "48px",
                    background: stat.bgGradient,
                    borderRadius: "12px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    border: `1px solid ${stat.borderColor}`,
                  }}
                >
                  <stat.icon sx={{ fontSize: "24px", color: stat.gradient }} />
                </Box>
              </Stack>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
