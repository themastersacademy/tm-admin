"use client";
import { Stack, Tooltip, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import Account from "./Account";
import LinkComp from "./LinkComp";
import MasterLogo from "./MasterLogo";
import { useState } from "react";

export default function SideNav() {
  const [isSideNavOpen, setIsSideNavOpen] = useState(true);

  const drawer = () => {
    setIsSideNavOpen((prev) => !prev);
  };
  const sideNavOpen = () => {
    setIsSideNavOpen(false);
  };

  return (
    <Stack
      bgcolor="var(--white)"
      sx={{
        borderRight: "1px solid var(--border-color)",
        position: "relative",
        boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
      }}
    >
      <Stack
        sx={{
          width: isSideNavOpen ? "80px" : "280px",
          height: "100vh",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          overflowX: "hidden",
          overflowY: "hidden",
        }}
      >
        <Stack
          position="fixed"
          gap="32px"
          height="100vh"
          padding={isSideNavOpen ? "24px 12px" : "24px 16px"}
          sx={{
            width: isSideNavOpen ? "80px" : "280px",
            transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            overflowX: "hidden",
            "& > :last-child": { marginTop: "auto" },
          }}
        >
          <MasterLogo isSideNavOpen={isSideNavOpen} />
          <LinkComp isSideNavOpen={isSideNavOpen} sideNavOpen={sideNavOpen} />
          <Account isSideNavOpen={isSideNavOpen} />
        </Stack>
      </Stack>

      <Tooltip
        title={isSideNavOpen ? "Expand" : "Collapse"}
        placement="right"
        slotProps={{
          tooltip: {
            sx: {
              backgroundColor: "var(--text1)",
              color: "#fff",
              fontSize: "12px",
              fontWeight: 600,
              padding: "6px 10px",
              borderRadius: "6px",
            },
          },
        }}
      >
        <IconButton
          onClick={drawer}
          sx={{
            position: "fixed",
            top: "70px",
            left: isSideNavOpen ? "68px" : "268px",
            width: "32px",
            height: "32px",
            backgroundColor: "var(--white)",
            border: "1.5px solid var(--border-color)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 10,
            "&:hover": {
              backgroundColor: "var(--primary-color)",
              borderColor: "var(--primary-color)",
              boxShadow: "0 4px 12px rgba(var(--primary-rgb), 0.3)",
              "& svg": {
                color: "#fff",
              },
            },
          }}
        >
          {isSideNavOpen ? (
            <ChevronRight
              sx={{
                fontSize: "20px",
                color: "var(--primary-color)",
                transition: "color 0.2s",
              }}
            />
          ) : (
            <ChevronLeft
              sx={{
                fontSize: "20px",
                color: "var(--primary-color)",
                transition: "color 0.2s",
              }}
            />
          )}
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
