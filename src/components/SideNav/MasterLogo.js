import { Stack, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

export default function MasterLogo({isSideNavOpen}) {
    return (
        <>
        <Stack
        sx={{
          flexDirection: "row",
          gap: "15px",
        }}
      ><Link href="/login">
        <Image
          src={process.env.NEXT_PUBLIC_LOGO_URL}
          alt="logo"
          width={60}
          height={26}
        /></Link>
         
        {!isSideNavOpen && (<Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "14px",
            fontWeight: "700",
            letterSpacing: "0.3px",
            color: "var(--primary-color)",
            whiteSpace:"nowrap"
          }}
        >
          {process.env.NEXT_PUBLIC_COMPANY_NAME}
        </Typography>)}
      </Stack>
      </>
    )
}