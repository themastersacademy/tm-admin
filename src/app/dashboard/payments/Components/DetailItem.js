import { Stack, Box, Typography } from "@mui/material";

const DetailItem = ({ icon, text }) => (
  <Stack direction="row" gap="8px" alignItems="center">
    <Box sx={{ color: "var(--text3)", display: "flex" }}>
      {icon && <icon.type sx={{ fontSize: "16px" }} />}
    </Box>
    <Typography sx={{ fontSize: "13px", color: "var(--text2)" }}>
      {text}
    </Typography>
  </Stack>
);

export default DetailItem;
