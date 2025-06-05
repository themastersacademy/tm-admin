"use client";
import { MoreVert } from "@mui/icons-material";
import { Card, IconButton, Menu, Stack, Typography } from "@mui/material";
import { useState } from "react";

export default function SecondaryCard({
  icon,
  title,
  options = [],
  subTitle,
  cardWidth,
  onClick,
  button,
  isLive,
  live,
  sx,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuOpen = (event) => {
    setIsMenuOpen(event.currentTarget);
  };
  const menuClose = () => {
    setIsMenuOpen(null);
  };

  return (
    <Card
      sx={{
        width: cardWidth,
        height: "80px",
        border: "1px solid",
        borderColor: "var(--border-color)",
        borderRadius: "10px",
        padding: "8px",
        ...sx,
      }}
      elevation={0}
      onClick={onClick}
    >
      <Stack flexDirection="row">
        <Stack flexDirection="row" alignItems="center" gap="15px">
          <Stack
            sx={{
              minWidth: "62px",
              height: "60px",
              backgroundColor: "var(--sec-color-acc-1)",
              borderRadius: "10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {icon}
          </Stack>
          <Stack gap="8px">
            <Typography
              component="div"
              sx={{
                color: "var(text4)",
                fontFamily: "Lato",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              {title}
            </Typography>
            <Typography
              component="div"
              sx={{
                color: "var(text4)",
                fontFamily: "Lato",
                fontSize: "12px",
              }}
            >
              {subTitle}
            </Typography>
          </Stack>
        </Stack>
        <Stack
          marginLeft="auto"
          alignItems="center"
          flexDirection="row"
          gap="10px"
        >
          {live}
          {isLive}
          {button}
          {options.length > 0 && (
            <>
              <IconButton
                sx={{
                  marginLeft: "auto",
                  "&.MuiIconButton-root": {
                    padding: "0px",
                  },
                }}
                onClick={menuOpen}
                disableRipple
              >
                <MoreVert sx={{ color: "var(--text3)" }} />
              </IconButton>

              <Menu
                anchorEl={isMenuOpen}
                open={Boolean(isMenuOpen)}
                onClose={menuClose}
                disableScrollLock={true}
                sx={{ "& .MuiList-root": { padding: "3px" } }}
                slotProps={{
                  paper: {
                    style: {
                      border: "1px solid",
                      borderColor: "var(--border-color)",
                      borderRadius: "7px",
                      padding: "0px",
                    },
                  },
                }}
                elevation={0}
              >
                {options.map((option, index) => (
                  <Stack key={index} onClick={menuClose}>
                    {option}
                  </Stack>
                ))}
              </Menu>
            </>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
