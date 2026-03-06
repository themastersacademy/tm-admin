import {
  Button,
  Dialog,
  IconButton,
  Slide,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Close, East } from "@mui/icons-material";

export default function CreateExamDialog({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  infoText,
  onCreate,
  isLoading,
  children,
}) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      disableScrollLock={true}
      TransitionComponent={Slide}
      sx={{
        "& .MuiDialog-paper": {
          minWidth: "520px",
          maxWidth: "620px",
          borderRadius: "20px",
          overflow: "hidden",
        },
      }}
    >
      {/* Teal Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          padding: "20px 24px",
          backgroundColor: "var(--primary-color)",
          color: "white",
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.5}>
          {icon && (
            <Stack
              sx={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(255,255,255,0.15)",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
              }}
            >
              {icon}
            </Stack>
          )}
          <Stack>
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "18px",
                fontWeight: 700,
                color: "white",
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                sx={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Stack>
        </Stack>
        <IconButton
          onClick={onClose}
          sx={{
            color: "white",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
          }}
        >
          <Close />
        </IconButton>
      </Stack>

      {/* Content */}
      <Stack
        sx={{
          padding: "24px",
          gap: "20px",
          maxHeight: "60vh",
          overflowY: "auto",
        }}
      >
        {infoText && (
          <Stack
            sx={{
              backgroundColor: "rgba(24, 113, 99, 0.06)",
              padding: "12px 16px",
              borderRadius: "10px",
              border: "1px solid rgba(24, 113, 99, 0.15)",
            }}
          >
            <Typography
              sx={{
                fontSize: "13px",
                color: "var(--primary-color)",
                fontWeight: 500,
              }}
            >
              {infoText}
            </Typography>
          </Stack>
        )}
        {children}
      </Stack>

      {/* Footer */}
      <Stack
        direction="row"
        justifyContent="flex-end"
        gap={2}
        sx={{
          padding: "16px 24px",
          borderTop: "1px solid var(--border-color)",
          backgroundColor: "var(--bg-color)",
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: "none",
            borderRadius: "10px",
            height: "42px",
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--text2)",
            borderColor: "var(--border-color)",
            minWidth: "100px",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onCreate}
          variant="contained"
          disabled={isLoading}
          endIcon={!isLoading ? <East /> : null}
          sx={{
            textTransform: "none",
            borderRadius: "10px",
            height: "42px",
            fontSize: "14px",
            fontWeight: 600,
            backgroundColor: "var(--primary-color)",
            minWidth: "120px",
            boxShadow: "0 4px 15px rgba(24, 113, 99, 0.3)",
            "&:hover": {
              backgroundColor: "var(--primary-color-dark)",
              boxShadow: "0 6px 20px rgba(24, 113, 99, 0.4)",
            },
            "&.Mui-disabled": {
              background: "var(--border-color)",
              color: "var(--text3)",
            },
          }}
          disableElevation
        >
          {isLoading ? (
            <CircularProgress size={20} sx={{ color: "white" }} />
          ) : (
            "Create"
          )}
        </Button>
      </Stack>
    </Dialog>
  );
}
