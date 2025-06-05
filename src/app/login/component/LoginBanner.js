import { Stack, Typography } from "@mui/material";
import Image from "next/image";
import loginBanner from "@/public/Images/LoginBanner.svg";
import incrix_logo from "@/public/Images/INCRIX_Logo.svg";

export default function LoginBanner() {
  return (
    <Stack
      bgcolor="var(--primary-color)"
      width="50%"
      height="100vh"
    >
      <Stack alignItems="center" justifyContent="center" height="100vh">
        <Image
          src={loginBanner.src}
          alt="loginbanner"
          width={600}
          height={400}
        />
        <Typography
          sx={{
            textAlign: "center",
            fontFamily: "Lato",
            fontSize: "16px",
            fontWeight: "700",
            color: "var(--white)",
            width: "420px",
          }}
        >
          Delivering Innovative Solutions for Seamless Learning Management and
          Beyond
        </Typography>
      </Stack>
      <Stack sx={{ flexDirection: "row",padding:"0px 20px 20px 20px", }}>
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "16px",
            fontWeight: "700",
            color: "var(--white)",
            marginRight:"auto"
          }}
        >
          Powered by Incrix Softwares
        </Typography>
        <Image
          src={incrix_logo.src}
          alt="incrixLOGO"
          width={120}
          height={25}
        />
      </Stack>
    </Stack>
  );
}
