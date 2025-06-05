import { Stack, Typography } from "@mui/material";

export default function ErrorQuestionCard({ error }) {
  return (
    
    <Stack
      sx={{
        width: "100%",
        minHeight: "100px",
        border: "1px solid red",
        borderRadius: "8px",
        padding: "10px",
        gap: "10px",
      }}
    >
      <Stack>
        <Typography fontSize="16px">Errors in row {error.row}</Typography>
        <Stack spacing={0.5}>
          {error.errors.map((e, i) => (
            <Typography key={i} fontSize="14px" sx={{ whiteSpace: "pre-line" }}>
              {i + 1}. {e}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
