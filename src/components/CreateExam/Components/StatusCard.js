import { Info } from "@mui/icons-material";
import { Card, Stack, Tooltip, Typography } from "@mui/material";
import Image from "next/image";
import curve from "@/public/Icons/curve.svg";

export default function StatusCard({ icon, info, title, count }) {
  return (
    <Stack flexDirection="row" gap="30px">
      <Card
        sx={{
          width: "180px",
          padding: "20px 16px",
          border: "1px solid",
          borderColor: "var(--border-color)",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          borderRadius: "12px",
        }}
        elevation={0}
      >
        <Stack flexDirection="row" gap="10px" alignItems="center">
          {icon && (
            <Stack
              sx={{
                backgroundColor: "var(--sec-color-acc-1)",
                width: "22px",
                height: "22px",
                borderRadius: "50px",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image src={curve.src} alt="icon" width={12} height={10} />
            </Stack>
          )}

          <Typography
            sx={{ fontFamily: "Lato", fontSize: "14px", fontWeight: "700" }}
          >
            {title}
          </Typography>
          {info && (
            <Tooltip title="info" placement="right">
              <Info sx={{ color: "var(--sec-color)" }} />
            </Tooltip>
          )}
        </Stack>
        <Typography
          sx={{ fontFamily: "Lato", fontSize: "28px", fontWeight: "700" }}
        >
          {count}
        </Typography>
      </Card>
    </Stack>
  );
}
