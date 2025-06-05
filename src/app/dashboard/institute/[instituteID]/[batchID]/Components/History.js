import { Add } from "@mui/icons-material";
import { Button, Stack, Typography } from "@mui/material";

export default function BatchHistory() {
  return (
    <Stack
      sx={{
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        padding: "20px",
        backgroundColor: "var(--white)",
        minHeight: "100vh",
        gap: "20px",
        marginTop: "20px",
      }}
    >
      <Stack flexDirection="row" justifyContent="space-between">
        <Typography sx={{ fontSize: "20px", fontWeight: "700" }}>
          History
        </Typography>
      </Stack>
      <Stack
        flexDirection="row"
        flexWrap="wrap"
        rowGap="15px"
        columnGap="30px"
      ></Stack>
    </Stack>
  );
}
