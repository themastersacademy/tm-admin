import { Stack, Typography, Tooltip, Box } from "@mui/material";

const Label = ({ children, required, helpText }) => (
  <Stack direction="row" alignItems="center" gap={0.5} mb="6px">
    <Typography
      sx={{
        fontSize: "13px",
        fontWeight: 600,
        color: "var(--text1)",
      }}
    >
      {children}
    </Typography>
    {required && (
      <Typography sx={{ color: "red", fontSize: "13px" }}>*</Typography>
    )}
    {helpText && (
      <Tooltip title={helpText} arrow>
        <Box
          sx={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            backgroundColor: "var(--text3)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "9px",
            fontWeight: 700,
            cursor: "help",
          }}
        >
          ?
        </Box>
      </Tooltip>
    )}
  </Stack>
);

export default Label;
