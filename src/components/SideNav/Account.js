import { useRouter } from "next/navigation";
import {
  Avatar,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import more_img from "@/public/Icons/More.svg";
import students_img from "@/public/Icons/Students.svg";
import logout_img from "@/public/Icons/Logout.svg";

export default function Account({ isSideNavOpen }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Stack
        onClick={handleClick}
        sx={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "auto",
          borderRadius: "35px",
          cursor: "pointer",
          padding: isSideNavOpen ? "12px" : "4px 12px 4px 4px",
          backgroundColor: open ? "var(--primary-color-acc-2)" : "transparent",
          "&:hover": { backgroundColor: "var(--primary-color-acc-2)" },
        }}
      >
        <Stack sx={{ flexDirection: "row", alignItems: "center", gap: "12px" }}>
          <Tooltip title="Account" disableHoverListener={!isSideNavOpen}>
            <Avatar />
          </Tooltip>
          {!isSideNavOpen && (
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "14px",
                fontWeight: "700",
                color: "var(--primary-color)",
              }}
            >
              Abishek
            </Typography>
          )}
        </Stack>
        {!isSideNavOpen && (
          <Image
            src={more_img.src}
            alt="more"
            width={18}
            height={18}
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0)",
              transition: "all .5s ease",
            }}
          />
        )}
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        autoFocus={false}
        disableScrollLock={true}
        sx={{
          "& .MuiPaper-root": {
            width: "240px",
            marginTop: "-90px",
            backgroundColor: "var(--sec-color-acc-2)",
            borderRadius: "6px",
            color: "var(--text3)",
            border: "1px solid",
            borderColor: "var(--border-color)",
            "& .MuiMenuItem-root": {
              "&:hover": {
                backgroundColor: "var(--sec-color-acc-1)",
              },
              "&:active": {
                backgroundColor: "var(--sec-color-acc-1) !important",
              },
            },
          },
        }}
        elevation={0}
      >
        <MenuItem
          onClick={() => {
            router.push("/dashboard/profile");
            handleClose();
          }}
          sx={{
            gap: "15px",
            fontFamily: "Lato",
            fontSize: "14px",
            fontWeight: "700",
          }}
        >
          <Image src={students_img.src} alt="profile" width={16} height={16} />
          Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            router.push("/api/logout");
            handleClose();
          }}
          sx={{
            gap: "15px",
            fontFamily: "Lato",
            fontSize: "14px",
            fontWeight: "700",
          }}
        >
          <Image src={logout_img.src} alt="profile" width={16} height={16} />
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
