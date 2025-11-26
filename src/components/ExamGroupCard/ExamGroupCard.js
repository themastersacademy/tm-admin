import { Stack, Typography, Chip, Box } from "@mui/material";
import { Groups, CheckCircle } from "@mui/icons-material";

export default function ExamGroupCard({ group, onClick }) {
  // Calculate total exams in the group - check multiple possible properties
  const examCount =
    group?.examCount ||
    group?.examList?.length ||
    group?.exams?.length ||
    group?.totalExams ||
    0;
  const isLive = group?.isLive || false;

  return (
    <Stack
      onClick={onClick}
      sx={{
        width: "350px",
        minHeight: "160px",
        backgroundColor: "#fff",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        padding: "20px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
          borderColor: "var(--primary-color)",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "4px",
          height: "100%",
          backgroundColor: isLive ? "var(--primary-color)" : "#e0e0e0",
          transition: "all 0.3s ease",
        },
        "&:hover::before": {
          width: "6px",
        },
      }}
    >
      {/* Header */}
      <Stack
        flexDirection="row"
        justifyContent="space-between"
        alignItems="flex-start"
        marginBottom="16px"
      >
        <Stack
          sx={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            backgroundColor: "var(--primary-color-light, #e3f2fd)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Groups sx={{ color: "var(--primary-color)", fontSize: "24px" }} />
        </Stack>

        {isLive && (
          <Chip
            icon={<CheckCircle sx={{ fontSize: "14px !important" }} />}
            label="Live"
            size="small"
            sx={{
              backgroundColor: "#e8f5e9",
              color: "#2e7d32",
              fontWeight: "600",
              fontSize: "11px",
              height: "24px",
              "& .MuiChip-icon": {
                color: "#2e7d32",
              },
            }}
          />
        )}
      </Stack>

      {/* Title */}
      <Typography
        sx={{
          fontFamily: "Lato",
          fontSize: "18px",
          fontWeight: "700",
          color: "var(--text1)",
          marginBottom: "8px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          lineHeight: "1.4",
        }}
      >
        {group?.title || "Untitled Group"}
      </Typography>

      {/* Exam Count */}
      <Stack flexDirection="row" alignItems="center" gap="8px" marginTop="auto">
        <Box
          sx={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: examCount > 0 ? "var(--primary-color)" : "#bdbdbd",
          }}
        />
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "14px",
            color: "var(--text3)",
          }}
        >
          {examCount} {examCount === 1 ? "Exam" : "Exams"}
        </Typography>
      </Stack>
    </Stack>
  );
}
