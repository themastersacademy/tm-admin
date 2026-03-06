import { Stack, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

export default function MasterLogo({ isSideNavOpen }) {
  return (
    <Stack
      sx={{
        flexDirection: "row",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <Link href="/login">
        <Image
          src={process.env.NEXT_PUBLIC_LOGO_URL}
          alt="logo"
          width={36}
          height={36}
        />
      </Link>

      {!isSideNavOpen && (
        <Typography
          sx={{
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--primary-color)",
            whiteSpace: "nowrap",
          }}
        >
          {process.env.NEXT_PUBLIC_COMPANY_NAME}
        </Typography>
      )}
    </Stack>
  );
}
