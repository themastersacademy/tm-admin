import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
          minWidth: "500px",
          maxWidth: "600px",
          borderRadius: "16px",
          border: "1px solid var(--border-color)",
          boxShadow: "0px 12px 40px rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "20px 20px",
          borderBottom: "1px solid var(--border-color)",
          backgroundColor: "#fafafa",
          marginBottom: "20px",
        }}
      >
        <Stack gap="4px">
          <Stack flexDirection="row" alignItems="center" gap="12px">
            {icon && (
              <Stack
                sx={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  backgroundColor: "var(--primary-color-light, #e3f2fd)",
                  color: "var(--primary-color)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {icon}
              </Stack>
            )}
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "20px",
                fontWeight: "700",
                color: "var(--text1)",
              }}
            >
              {title}
            </Typography>
          </Stack>
          {subtitle && (
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "14px",
                color: "var(--text3)",
                marginLeft: icon ? "52px" : "0px",
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Stack>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            borderRadius: "8px",
            color: "var(--text3)",
            "&:hover": {
              backgroundColor: "rgba(0,0,0,0.05)",
              color: "var(--text1)",
            },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: "32px 32px", paddingTop: "32px" }}>
        <Stack gap="24px">
          {infoText && (
            <Stack
              sx={{
                backgroundColor: "#e3f2fd",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid #bbdefb",
              }}
            >
              <Typography
                sx={{
                  fontSize: "13px",
                  color: "#0d47a1",
                  fontFamily: "Lato",
                }}
              >
                💡 {infoText}
              </Typography>
            </Stack>
          )}
          {children}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          padding: "24px 32px",
          borderTop: "1px solid var(--border-color)",
          backgroundColor: "#fafafa",
        }}
      >
        <Button
          onClick={onClose}
          variant="text"
          sx={{
            textTransform: "none",
            color: "var(--text3)",
            fontWeight: "600",
            fontSize: "14px",
            "&:hover": {
              backgroundColor: "transparent",
              color: "var(--text1)",
            },
          }}
          disableElevation
        >
          Cancel
        </Button>
        <Button
          onClick={onCreate}
          variant="contained"
          disabled={isLoading}
          startIcon={
            isLoading ? (
              <CircularProgress size={16} sx={{ color: "#fff" }} />
            ) : null
          }
          endIcon={!isLoading ? <East /> : null}
          sx={{
            textTransform: "none",
            backgroundColor: "var(--primary-color)",
            color: "#fff",
            fontWeight: "600",
            padding: "10px 28px",
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(25, 118, 210, 0.2)",
            "&:hover": {
              backgroundColor: "var(--primary-color)",
              opacity: 0.9,
              boxShadow: "0px 6px 16px rgba(25, 118, 210, 0.3)",
            },
            "&.Mui-disabled": {
              backgroundColor: "var(--primary-color)",
              opacity: 0.6,
              color: "#fff",
            },
          }}
          disableElevation
        >
          {isLoading ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
