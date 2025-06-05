import Stack from "@mui/material/Stack";
import LinearProgress from "@mui/material/LinearProgress";

export default function LinearProgressLoading() {
  return (
    <Stack sx={{ width: "100%" }}>
      <LinearProgress
        sx={{
          backgroundColor: "var(--sec-color-acc-1)",
          "& .MuiLinearProgress-bar": {
            backgroundColor: "var(--sec-color)",
            borderRadius: "10px",
          },
        }}
      />
    </Stack>
  );
}
