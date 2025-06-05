import { Close } from "@mui/icons-material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";

export default function LongDialogBox({
  children,
  isOpen,
  onClose,
  title,
  titleComponent,
  actions,
}) {
  return (
    <Dialog
      open={isOpen}
      disableScrollLock={true}
      sx={{
        "& .MuiDialog-paper": {
          width: "100%",
          maxWidth: "lg",
          minHeight: "90vh",
          borderRadius: "10px",
          border: "1px solid",
          borderColor: "var(--border-color)",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: "Lato",
          fontSize: "20px",
          fontWeight: "700",
          paddingBottom: "0px",
        }}
      >
        <Stack direction="row" alignItems="center" gap="10px">
          {title}
          <Close
            onClick={onClose}
            sx={{ cursor: "pointer", marginLeft: "auto" }}
          />
        </Stack>
        {titleComponent}
      </DialogTitle>
      <DialogContent sx={{ padding: "0px" }}>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
}
