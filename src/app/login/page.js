import { Stack } from "@mui/material";
import LoginBanner from "./component/LoginBanner";
import LoginPage from "./component/LoginPage";

export const metadata = {
  title: "Login page",
};

export default function Login() {
  return (
    <Stack flexDirection="row">
      <LoginPage />
      <LoginBanner />
    </Stack>
  );
}
