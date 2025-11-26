"use client";
import { Delete, InsertDriveFile } from "@mui/icons-material";
import { Card, IconButton, Stack, Typography, Tooltip } from "@mui/material";

export default function SubjectCard({ title, onRemove }) {
  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: "300px",
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid var(--border-color)",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "var(--primary-color)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Stack flexDirection="row" alignItems="center" gap="16px">
        <Stack
          sx={{
            width: "48px",
            height: "48px",
            borderRadius: "10px",
            backgroundColor: "var(--primary-color-acc-1)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <InsertDriveFile sx={{ color: "var(--primary-color)" }} />
        </Stack>
        <Stack flex={1} overflow="hidden">
          <Typography
            sx={{
              fontFamily: "Lato",
              fontWeight: 700,
              fontSize: "16px",
              color: "var(--text1)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "12px",
              color: "var(--text3)",
            }}
          >
            Subject
          </Typography>
        </Stack>
        <Tooltip title="Remove Subject">
          <IconButton
            size="small"
            onClick={onRemove}
            sx={{
              color: "var(--text3)",
              "&:hover": {
                color: "var(--delete-color)",
                backgroundColor: "#ffebee",
              },
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Card>
  );
}
