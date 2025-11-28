import { Stack, Typography, Box, Chip } from "@mui/material";
import { ErrorOutline, Circle } from "@mui/icons-material";

export default function ErrorQuestionCard({ error }) {
  return (
    <Stack
      direction="row"
      gap="12px"
      sx={{
        width: "100%",
        p: "12px",
        backgroundColor: "#FEF2F2",
        border: "1px solid #FECACA",
        borderRadius: "8px",
        alignItems: "flex-start",
      }}
    >
      <Box
        sx={{
          minWidth: "24px",
          height: "24px",
          borderRadius: "50%",
          backgroundColor: "#FEE2E2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mt: "2px",
        }}
      >
        <ErrorOutline sx={{ color: "#DC2626", fontSize: "16px" }} />
      </Box>

      <Stack gap="4px" width="100%">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            fontSize="13px"
            fontWeight="700"
            color="#991B1B"
            sx={{ textTransform: "uppercase", letterSpacing: "0.5px" }}
          >
            Row {error.row}
          </Typography>
          <Chip
            label={`${error.errors.length} Issues`}
            size="small"
            sx={{
              height: "18px",
              fontSize: "10px",
              fontWeight: "700",
              backgroundColor: "#FEE2E2",
              color: "#991B1B",
            }}
          />
        </Stack>

        <Stack gap="4px">
          {error.errors.map((e, i) => (
            <Stack key={i} direction="row" gap="6px" alignItems="flex-start">
              <Circle sx={{ fontSize: "4px", color: "#EF4444", mt: "7px" }} />
              <Typography
                fontSize="13px"
                color="#7F1D1D"
                sx={{ lineHeight: 1.4 }}
              >
                {e}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
