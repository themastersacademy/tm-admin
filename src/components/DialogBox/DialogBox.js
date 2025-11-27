import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  Stack,
} from "@mui/material";

export default function DialogBox({
  children,
  isOpen,
  title,
  icon,
  actionButton,
  text,
  customWidth,
}) {
  return (
    <Dialog
      open={isOpen}
      disableScrollLock={true}
      TransitionComponent={Slide}
      sx={{
        "& .MuiDialog-paper": {
          minWidth: "600px",
          maxWidth: customWidth || "650px",
          width: customWidth ? "100%" : "auto",
          borderRadius: "10px",
          border: "1px solid",
          borderColor: "var(--border-color)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "Lato",
          fontSize: "20px",
          fontWeight: "700",
          paddingBottom: "0px",
        }}
      >
        {title}
        {icon}
      </DialogTitle>
      <DialogContent sx={{ padding: "0px" }}>{children}</DialogContent>
      <DialogActions sx={{ justifyContent: "center" }}>
        <Stack>{actionButton}</Stack>
        {/* <Button
          variant="text"
          onClick={onClick}
          sx={{
            textTransform: "none",
            color: "var(--primary-color)",
            fontFamily: "Lato",
            fontSize: "14px",
          }}
          endIcon={<East />}
        >
          {actionText}
        </Button> */}
      </DialogActions>
    </Dialog>
  );
}
