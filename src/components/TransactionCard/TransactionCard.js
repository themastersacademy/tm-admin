"use client";
import { MoreVert, SaveAlt } from "@mui/icons-material";
import {
  Card,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

export default function TransactionCard({
  icon,
  options = [],
  name,
  email,
  date,
  id,
  price,
  status,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <Card
      sx={{
        width: "100%",
        height: "auto",
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
        flexWrap: "wrap",
      }}
      elevation={0}
    >
      <Stack
        sx={{
          minWidth: 62,
          height: 60,
          backgroundColor: "var(--sec-color-acc-1)",
          borderRadius: "10px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {icon}
      </Stack>
      <Stack flexDirection="row">
        <Stack spacing={0.5} flex={1} minWidth={200}>
          <Typography variant="body1" fontWeight={700} color="var(--text1)">
            {name}
          </Typography>
          <Typography variant="body2" color="var(--text3)">
            {email}
          </Typography>
        </Stack>
        <Stack spacing={0.5} minWidth={160}>
          <Typography variant="body2" color="var(--text3)">
            Goal name
          </Typography>
          <Typography variant="body2" color="var(--text3)">
            Subscription/Course
          </Typography>
        </Stack>
        <Stack spacing={0.5} minWidth={160}>
          <Typography variant="body2" fontWeight={700} color="var(--text1)">
            {date}
          </Typography>
          <Typography variant="body2" color="var(--text3)">
            ID: {id}
          </Typography>
        </Stack>
      </Stack>
      <Stack
        flexDirection="row"
        alignItems="center"
        sx={{ marginLeft: "auto", gap: "20px" }}
      >
        <Typography variant="h6" color="var(--primary-color)">
          {price}
        </Typography>
        <Chip
          label={status}
          size="small"
          sx={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--primary-color)",
            backgroundColor: "var(--primary-color-acc-2)",
          }}
        />
        <IconButton disableRipple>
          <SaveAlt sx={{ color: "var(--text3)" }} />
        </IconButton>
        <IconButton onClick={handleMenuOpen} disableRipple>
          <MoreVert sx={{ color: "var(--text3)" }} />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          disableScrollLock
          PaperProps={{
            sx: {
              border: "1px solid var(--border-color)",
              marginLeft: "auto",
            },
          }}
          MenuListProps={{
            sx: {
              p: 0,
              marginLeft: "auto",
            },
          }}
        >
          {options.map((option, index) => (
            <MenuItem
              key={index}
              sx={{
                fontFamily: "Lato",
                fontSize: "14px",
                padding: "5px",
                gap: "5px",
                color: "var(--delete-color)",
              }}
              onClick={handleMenuClose}
            >
              {option}
            </MenuItem>
          ))}
        </Menu>
      </Stack>
    </Card>
  );
}
