"use client";
import { Stack, Typography, Grid, Box } from "@mui/material";
import {
  Quiz,
  SignalCellularAlt1Bar,
  SignalCellularAlt2Bar,
  SignalCellularAlt,
  History,
} from "@mui/icons-material";

export default function QuestionsHeader({ stats = {}, actions }) {
  const {
    totalQuestions = 0,
    difficultyCounts = { 1: 0, 2: 0, 3: 0 },
    recentCount = 0,
  } = stats;

  const statCards = [
    {
      title: "Total Questions",
      value: totalQuestions.toLocaleString("en-IN"),
      icon: Quiz,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      bgGradient:
        "linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.06) 100%)",
      borderColor: "rgba(102, 126, 234, 0.3)",
    },
    {
      title: "Easy Questions",
      value: (difficultyCounts[1] || 0).toLocaleString("en-IN"),
      icon: SignalCellularAlt1Bar,
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      bgGradient:
        "linear-gradient(135deg, rgba(67, 233, 123, 0.12) 0%, rgba(56, 249, 215, 0.06) 100%)",
      borderColor: "rgba(67, 233, 123, 0.3)",
    },
    {
      title: "Medium Questions",
      value: (difficultyCounts[2] || 0).toLocaleString("en-IN"),
      icon: SignalCellularAlt2Bar,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      bgGradient:
        "linear-gradient(135deg, rgba(240, 147, 251, 0.12) 0%, rgba(245, 87, 108, 0.06) 100%)",
      borderColor: "rgba(240, 147, 251, 0.3)",
    },
    {
      title: "Hard Questions",
      value: (difficultyCounts[3] || 0).toLocaleString("en-IN"),
      icon: SignalCellularAlt,
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      bgGradient:
        "linear-gradient(135deg, rgba(250, 112, 154, 0.12) 0%, rgba(254, 225, 64, 0.06) 100%)",
      borderColor: "rgba(250, 112, 154, 0.3)",
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
      {/* Header Title & Actions */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap="16px"
        mb={3}
      >
        <Stack gap="8px">
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--text1)",
            }}
          >
            Question Bank
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              color: "var(--text3)",
              fontWeight: 400,
            }}
          >
            Manage and organize your questions with detailed insights
          </Typography>
        </Stack>
        <Stack direction="row" gap="10px">
          {actions}
        </Stack>
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
