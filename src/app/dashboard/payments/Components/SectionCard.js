import { Paper, Stack, Box, Typography } from "@mui/material";

const SectionCard = ({ title, icon, children, helpText }) => (
  <Paper
    elevation={0}
    sx={{
      padding: "20px",
      borderRadius: "12px",
      border: "1px solid var(--border-color)",
      backgroundColor: "var(--bg-color)",
      transition: "all 0.2s ease",
      "&:hover": {
        borderColor: "var(--primary-color)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      },
    }}
  >
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      mb={2}
    >
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Box
          sx={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background:
              "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-dark) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {icon}
        </Box>
        <Stack>
          <Typography
            sx={{
              fontSize: "15px",
              fontWeight: 700,
              color: "var(--text1)",
            }}
          >
            {title}
          </Typography>
          {helpText && (
            <Typography sx={{ fontSize: "11px", color: "var(--text3)" }}>
              {helpText}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Stack>
    {children}
  </Paper>
);

export default SectionCard;
