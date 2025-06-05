import { Stack } from "@mui/material";
import LoginBanner from "./component/LoginBanner";
import LoginPage from "./component/LoginPage";
import Head from "next/head";
export const metadata = {
  title:"Login page",
};

export default function Login() {
  return (
    <Stack flexDirection="row">
      <Head>
        <title>Login</title>
      </Head>
      <LoginPage />
      <LoginBanner />
    </Stack>
  );
}
    