import { useRouter } from "next/navigation";
import {
  Avatar,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  Chip,
  Divider,
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
      <Tooltip
        title="Account Settings"
        disableHoverListener={!isSideNavOpen}
        placement="right"
        slotProps={{
          tooltip: {
            sx: {
              backgroundColor: "var(--text1)",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              padding: "8px 12px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
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
            borderRadius: "14px",
            cursor: "pointer",
            padding: isSideNavOpen ? "10px" : "12px",
            background: open
              ? "linear-gradient(135deg, rgba(var(--primary-rgb), 0.12) 0%, rgba(var(--primary-rgb), 0.08) 100%)"
              : "transparent",
            border: `1.5px solid ${
              open ? "rgba(var(--primary-rgb), 0.3)" : "transparent"
            }`,
            transition: "all 0.3s ease",
            "&:hover": {
              background:
                "linear-gradient(135deg, rgba(var(--primary-rgb), 0.12) 0%, rgba(var(--primary-rgb), 0.08) 100%)",
              borderColor: "rgba(var(--primary-rgb), 0.3)",
            },
          }}
        >
          <Stack
            sx={{ flexDirection: "row", alignItems: "center", gap: "12px" }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                border: "2px solid rgba(var(--primary-rgb), 0.3)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            />
            {!isSideNavOpen && (
              <Stack gap="2px">
                <Typography
                  sx={{
                    fontFamily: "Lato",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "var(--text1)",
                  }}
                >
                  Abishek
                </Typography>
                <Chip
                  label="Admin"
                  size="small"
                  sx={{
                    height: "18px",
                    fontSize: "10px",
                    fontWeight: 700,
                    backgroundColor: "rgba(var(--primary-rgb), 0.15)",
                    color: "var(--primary-color)",
                    border: "1px solid rgba(var(--primary-rgb), 0.3)",
                  }}
                />
              </Stack>
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
                transition: "all 0.3s ease",
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
            width: "240px",
            marginTop: "-90px",
            backgroundColor: "var(--white)",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            "& .MuiMenuItem-root": {
              borderRadius: "8px",
              margin: "4px 8px",
              padding: "10px 12px",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "rgba(var(--primary-rgb), 0.08)",
              },
              "&:active": {
                backgroundColor: "rgba(var(--primary-rgb), 0.12) !important",
              },
            },
          },
        }}
        elevation={0}
      >
        <Stack padding="12px 16px 8px 16px" gap="4px">
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--text1)",
              fontFamily: "Lato",
            }}
          >
            Abishek
          </Typography>
          <Typography
            sx={{
              fontSize: "12px",
              color: "var(--text3)",
              fontFamily: "Lato",
            }}
          >
            admin@example.com
          </Typography>
        </Stack>
        <Divider sx={{ margin: "8px 0" }} />
        <MenuItem
          onClick={() => {
            router.push("/dashboard/profile");
            handleClose();
          }}
          sx={{
            gap: "12px",
            fontFamily: "Lato",
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--text1)",
          }}
        >
          <Stack
            sx={{
              width: "32px",
              height: "32px",
              backgroundColor: "rgba(33, 150, 243, 0.1)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src={students_img.src}
              alt="profile"
              width={16}
              height={16}
            />
          </Stack>
          Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            router.push("/api/logout");
            handleClose();
          }}
          sx={{
            gap: "12px",
            fontFamily: "Lato",
            fontSize: "14px",
            fontWeight: 600,
            color: "#F44336",
          }}
        >
          <Stack
            sx={{
              width: "32px",
              height: "32px",
              backgroundColor: "rgba(244, 67, 54, 0.1)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image src={logout_img.src} alt="logout" width={16} height={16} />
          </Stack>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
