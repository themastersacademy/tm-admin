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
      }}
    >
      <Stack
        sx={{
          width: isSideNavOpen ? "68px" : "240px",
          height: "100vh",
          transition: "width 0.25s ease",
          position: "relative",
          overflowX: "hidden",
          overflowY: "hidden",
        }}
      >
        <Stack
          position="fixed"
          gap="20px"
          height="100vh"
          padding={isSideNavOpen ? "16px 10px" : "16px 12px"}
          sx={{
            width: isSideNavOpen ? "68px" : "240px",
            transition: "width 0.25s ease",
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
              fontSize: "11px",
              fontWeight: 600,
              padding: "4px 8px",
              borderRadius: "6px",
            },
          },
        }}
      >
        <IconButton
          onClick={drawer}
          sx={{
            position: "fixed",
            top: "52px",
            left: isSideNavOpen ? "56px" : "228px",
            width: "24px",
            height: "24px",
            backgroundColor: "var(--white)",
            border: "1px solid var(--border-color)",
            transition: "all 0.25s ease",
            zIndex: 10,
            "&:hover": {
              backgroundColor: "var(--primary-color)",
              borderColor: "var(--primary-color)",
              "& svg": {
                color: "#fff",
              },
            },
          }}
        >
          {isSideNavOpen ? (
            <ChevronRight
              sx={{
                fontSize: "16px",
                color: "var(--text3)",
              }}
            />
          ) : (
            <ChevronLeft
              sx={{
                fontSize: "16px",
                color: "var(--text3)",
              }}
            />
          )}
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
