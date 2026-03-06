"use client";
import { Delete, InsertDriveFile } from "@mui/icons-material";
import { Card, IconButton, Stack, Typography, Tooltip } from "@mui/material";

export default function SubjectCard({ title, onRemove }) {
  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: "260px",
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid var(--border-color)",
        transition: "all 0.15s ease",
        "&:hover": {
          borderColor: "var(--primary-color)",
          "& .delete-btn": { opacity: 1 },
        },
      }}
    >
      <Stack flexDirection="row" alignItems="center" gap="10px">
        <Stack
          sx={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            backgroundColor: "var(--primary-color-acc-2)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <InsertDriveFile sx={{ fontSize: "16px", color: "var(--primary-color)" }} />
        </Stack>
        <Stack flex={1} overflow="hidden">
          <Typography
            title={title}
            sx={{
              fontWeight: 600,
              fontSize: "13px",
              color: "var(--text1)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </Typography>
          <Typography sx={{ fontSize: "10px", color: "var(--text4)" }}>
            Subject
          </Typography>
        </Stack>
        <Tooltip title="Remove">
          <IconButton
            className="delete-btn"
            size="small"
            onClick={onRemove}
            sx={{
              width: 26,
              height: 26,
              opacity: 0,
              transition: "opacity 0.15s",
              color: "var(--text4)",
              "&:hover": {
                color: "#f44336",
                backgroundColor: "rgba(244, 67, 54, 0.04)",
              },
            }}
          >
            <Delete sx={{ fontSize: "14px" }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Card>
  );
}
