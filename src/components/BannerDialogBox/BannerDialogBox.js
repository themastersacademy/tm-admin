import {
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import Image from "next/image";
import CloseIcon from "@mui/icons-material/Close";

export default function BannerDialogBox({ isOpen, onClose, bannerURL }) {
  return (
    <Dialog
      open={isOpen}
      maxWidth="md"
      sx={{
        width: "100%",
        "& .MuiDialog-paper": {
          borderRadius: "10px",
          backgroundColor: "var(--white)",
        },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ padding: "15px 15px 0px 15px" }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", fontFamily: "Lato" }}
        >
          Banner Preview
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ borderRadius: "8px", padding: "4px" }}
        >
          <CloseIcon />
        </IconButton>
      </Stack>
      <DialogContent sx={{ padding: "20px" }}>
        {bannerURL && (
          <Image
            src={bannerURL}
            alt="Banner Preview"
            width={600}
            height={400}
            style={{
              objectFit: "contain",
              width: "100%",
              height: "auto",
              borderRadius: "10px",
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
