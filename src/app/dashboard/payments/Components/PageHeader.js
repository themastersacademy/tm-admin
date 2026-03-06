import { Stack, Typography } from "@mui/material";

const PageHeader = ({ title, action }) => {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mb: "16px" }}
    >
      <Typography
        sx={{
          fontSize: "15px",
          fontWeight: 700,
          color: "var(--text1)",
        }}
      >
        {title}
      </Typography>
      {action && (
        <Stack direction="row" gap="8px" alignItems="center">
          {action}
        </Stack>
      )}
    </Stack>
  );
};

export default PageHeader;
