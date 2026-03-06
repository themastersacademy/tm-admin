import { useRouter } from "next/navigation";
import {
  Avatar,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  Divider,
} from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import more_img from "@/public/Icons/More.svg";
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
      <Tooltip
        title="Account"
        disableHoverListener={!isSideNavOpen}
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
        <Stack
          onClick={handleClick}
          sx={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            borderRadius: "8px",
            cursor: "pointer",
            padding: isSideNavOpen ? "8px" : "8px 10px",
            backgroundColor: open
              ? "rgba(24, 113, 99, 0.06)"
              : "transparent",
            "&:hover": {
              backgroundColor: "rgba(24, 113, 99, 0.06)",
            },
          }}
        >
          <Stack
            sx={{ flexDirection: "row", alignItems: "center", gap: "10px" }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: "13px",
                fontWeight: 700,
              }}
            />
            {!isSideNavOpen && (
              <Stack gap="1px">
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--text1)",
                  }}
                >
                  Admin
                </Typography>
                <Typography
                  sx={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "var(--primary-color)",
                  }}
                >
                  Admin
                </Typography>
              </Stack>
            )}
          </Stack>
          {!isSideNavOpen && (
            <Image
              src={more_img.src}
              alt="more"
              width={16}
              height={16}
              style={{
                transform: open ? "rotate(180deg)" : "rotate(0)",
                transition: "transform 0.2s ease",
              }}
            />
          )}
        </Stack>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        autoFocus={false}
        disableScrollLock={true}
        sx={{
          "& .MuiPaper-root": {
            width: "200px",
            marginTop: "-80px",
            backgroundColor: "var(--white)",
            borderRadius: "10px",
            border: "1px solid var(--border-color)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            "& .MuiMenuItem-root": {
              borderRadius: "6px",
              margin: "2px 6px",
              padding: "8px 10px",
              "&:hover": {
                backgroundColor: "rgba(24, 113, 99, 0.06)",
              },
            },
          },
        }}
        elevation={0}
      >
        <Stack padding="10px 14px 6px" gap="2px">
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--text1)",
            }}
          >
            Abishek
          </Typography>
          <Typography
            sx={{
              fontSize: "11px",
              color: "var(--text3)",
            }}
          >
            Administrator
          </Typography>
        </Stack>
        <Divider sx={{ margin: "6px 0" }} />

        <MenuItem
          onClick={() => {
            router.push("/api/logout");
            handleClose();
          }}
          sx={{
            gap: "10px",
            fontSize: "13px",
            fontWeight: 600,
            color: "#F44336",
          }}
        >
          <Stack
            sx={{
              width: "28px",
              height: "28px",
              backgroundColor: "rgba(244, 67, 54, 0.08)",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image src={logout_img.src} alt="logout" width={14} height={14} />
          </Stack>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
