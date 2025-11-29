"use client";
import DeleteDialogBox from "@/src/components/DeleteDialogBox/DeleteDialogBox";
import { Button, CircularProgress, Stack } from "@mui/material";

export default function DeleteSubjectDialog({
  isOpen,
  onClose,
  onDelete,
  isLoading,
  warning,
  isError,
}) {
  return (
    <DeleteDialogBox
      isOpen={isOpen}
      onClose={onClose}
      warning={warning}
      isError={isError}
      title="Delete Subject?"
      subTitle="This action cannot be undone."
      actionButton={
        <Stack
          flexDirection="row"
          justifyContent="center"
          gap="16px"
          width="100%"
        >
          <Button
            variant="contained"
            onClick={onDelete}
            disabled={isLoading}
            sx={{
              textTransform: "none",
              backgroundColor: "var(--delete-color)",
              borderRadius: "8px",
              width: "140px",
              height: "44px",
              fontWeight: "600",
              boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2)",
              "&:hover": {
                backgroundColor: "#b91c1c",
                boxShadow: "0 6px 16px rgba(220, 38, 38, 0.3)",
              },
            }}
            disableElevation
          >
            {isLoading ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              "Yes, Delete"
            )}
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isLoading}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              borderColor: "var(--border-color)",
              color: "var(--text2)",
              width: "140px",
              height: "44px",
              fontWeight: "600",
              backgroundColor: "white",
              "&:hover": {
                backgroundColor: "var(--bg-color)",
                borderColor: "var(--text2)",
              },
            }}
            disableElevation
          >
            Cancel
          </Button>
        </Stack>
      }
    />
  );
}
