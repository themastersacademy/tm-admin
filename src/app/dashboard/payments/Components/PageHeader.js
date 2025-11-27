import { Stack, Typography } from "@mui/material";

const PageHeader = ({ title, action }) => {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mb: "24px" }}
    >
      <Typography
        sx={{
          fontSize: "20px",
          fontWeight: 700,
          color: "var(--text1)",
          letterSpacing: "-0.5px",
        }}
      >
        {title}
      </Typography>
      {action && (
        <Stack direction="row" gap="12px" alignItems="center">
          {action}
        </Stack>
      )}
    </Stack>
  );
};

export default PageHeader;
