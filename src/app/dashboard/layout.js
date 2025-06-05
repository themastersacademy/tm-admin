"use client";
import SideNav from "@/src/components/SideNav/SideNav";
import { Stack } from "@mui/material";
import { useEffect } from "react";
import { useSnackbar } from "../context/SnackbarContext";

export default function Layout({ children }) {
  const { showSnackbar } = useSnackbar();
  useEffect(() => {
    const handleSessionExpired = (e) => {
      showSnackbar(e.detail.message, e.detail.variant, "", "3000");
    };
    window.addEventListener("sessionExpired", handleSessionExpired);
    return () => {
      window.removeEventListener("sessionExpired", handleSessionExpired);
    };
  }, []);

  return (
    <Stack flexDirection="row" bgcolor="var(--sec-color-acc-2)">
      <SideNav />
      <Stack width="100%">{children}</Stack>
    </Stack>
  );
}
