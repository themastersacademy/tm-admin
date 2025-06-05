import { Stack, Typography } from "@mui/material";
import Image from "next/image";
import Form from "./Form";
import { SnackbarProvider } from "../../context/SnackbarContext";

export default function LoginPage() {
  return (
    <Stack
      width="50%"
      height="100vh"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        sx={{
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Stack
          sx={{
            width: "110px",
            height: "110px",
            backgroundColor: "var(--border-color)",
            borderRadius: "50%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Stack
            sx={{
              width: "70px",
              height: "70px",
              backgroundColor: "var(--white)",
              borderRadius: "50px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src={process.env.NEXT_PUBLIC_LOGO_URL}
              alt="logo"
              width={48}
              height={48}
            />
          </Stack>
        </Stack>
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "24px",
            fontWeight: "600",
            color: "var(--text1)",
            marginTop: "15px",
            marginBottom: "35px",
          }}
        >
          Sign In to your account
        </Typography>
        <Form />
      </Stack>
      <Typography
        sx={{
          marginTop: "auto",
          marginRight: "auto",
          fontFamily: "Lato",
          fontSize: "16px",
          fontWeight: "700",
          color: "var(--text4)",
          padding: "0px 0px 20px 20px",
        }}
      >
        ©2025 @ Incrix Techlutions
      </Typography>
    </Stack>
  );
}
