"use client";
import { Stack, Tooltip } from "@mui/material";
import Account from "./Account";
import LinkComp from "./LinkComp";
import MasterLogo from "./MasterLogo";
import Image from "next/image";
import { useState } from "react";
import drawer_img from "@/public/Icons/Drawer.svg";

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
          width: isSideNavOpen ? "100px" : "300px",
          height: "100vh",
          transition: "width .4s ease",
          position: "relative",
        }}
      >
        <Stack
          position="fixed"
          gap="50px"
          height="100vh"
          padding="40px 10px 40px 30px"
          transition="2s"
          sx={{
            "& > :last-child": { marginTop: "auto" },
          }}
        >
          <MasterLogo isSideNavOpen={isSideNavOpen} />
          <LinkComp isSideNavOpen={isSideNavOpen} sideNavOpen={sideNavOpen} />
          <Account isSideNavOpen={isSideNavOpen} />
        </Stack>
      </Stack>
      {/* <Tooltip
        title={isSideNavOpen ? "Expand" : "Collapse"}
        placement="left"
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: "transparent",
              color: "var(--sec-color)",
              fontSize: "13px",
              fontFamily: "Lato",
            },
          },
        }}
      > */}
        <Image
          src={drawer_img.src}
          alt="openclose"
          width={24}
          height={24}
          onClick={drawer}
          style={{
            position: "fixed",
            top: "70px",
            left: isSideNavOpen ? "89px" : "289px",
            cursor: "pointer",
            transform: isSideNavOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "all .4s ease",
          }}
        />
      {/* </Tooltip> */}
    </Stack>
  );
}
