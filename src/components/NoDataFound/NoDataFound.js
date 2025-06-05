import { Stack, Typography } from "@mui/material";
import Image from "next/image";
import noDataFound from "@/public/Images/noDataFound.svg";

export default function NoDataFound({ info }) {
  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100%"
      gap="15px"
    >
      <Image src={noDataFound.src} alt="noData" width={150} height={80} />
      <Typography
        sx={{ fontFamily: "Lato", fontSize: "14px", color: "var(--text4)" }}
      >
        {info}
      </Typography>
    </Stack>
  );
}
