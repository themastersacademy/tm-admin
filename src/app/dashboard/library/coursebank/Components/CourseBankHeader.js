import React from "react";
import { Stack, Typography, Button, Breadcrumbs, Link } from "@mui/material";
import {
  NavigateNext,
  Add,
  CloudUpload,
  CreateNewFolder,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function CourseBankHeader({
  title,
  breadcrumbs = [],
  actions = [],
}) {
  const router = useRouter();

  return (
    <Stack
      sx={{
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        borderRadius: "16px",
        padding: "20px 24px",
        gap: "20px",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap="16px"
      >
        <Stack gap="8px">
          {breadcrumbs.length > 0 && (
            <Breadcrumbs
              separator={<NavigateNext fontSize="small" />}
              aria-label="breadcrumb"
              sx={{ "& .MuiBreadcrumbs-li": { fontSize: "14px" } }}
            >
              <Link
                underline="hover"
                color="inherit"
                onClick={() => router.push("/dashboard/library/coursebank")}
                sx={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Library
              </Link>
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return isLast ? (
                  <Typography
                    key={index}
                    color="text.primary"
                    sx={{ fontSize: "14px", fontWeight: 600 }}
                  >
                    {crumb.label}
                  </Typography>
                ) : (
                  <Link
                    key={index}
                    underline="hover"
                    color="inherit"
                    onClick={() => router.push(crumb.href)}
                    sx={{ cursor: "pointer" }}
                  >
                    {crumb.label}
                  </Link>
                );
              })}
            </Breadcrumbs>
          )}
          <Typography
            sx={{
              fontSize: "24px",
              fontWeight: 800,
              color: "var(--text1)",
              fontFamily: "Lato",
            }}
          >
            {title}
          </Typography>
        </Stack>

        <Stack direction="row" gap="12px">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "contained"}
              startIcon={action.icon}
              onClick={action.onClick}
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                padding: "10px 20px",
                fontWeight: 600,
                boxShadow:
                  action.variant === "contained"
                    ? "0 4px 12px rgba(0,0,0,0.1)"
                    : "none",
                ...action.sx,
              }}
              disableElevation
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
