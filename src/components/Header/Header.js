"use client";
import { Button, Stack, Typography } from "@mui/material";
import SearchBox from "../SearchBox/SearchBox";
import { ArrowBackIosRounded } from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function Header({
  title,
  subtitle,
  button = [],
  search,
  back,
  searchValue,
  onSearchChange,
}) {
  const router = useRouter();
  return (
    <Stack
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        border: "1px solid",
        borderColor: "var(--border-color)",
        backgroundColor: "var(--white)",
        padding: "20px",
        borderRadius: "10px",
        height: "60px",
      }}
    >
      <Stack flexDirection="row" alignItems="center" gap="15px">
        {back && (
          <ArrowBackIosRounded
            onClick={() => {
              router.back();
            }}
            sx={{
              fontSize: "20px",
              cursor: "pointer",
              fontWeight: "700",
            }}
          />
        )}
        <Stack>
          <Typography
            sx={{ fontFamily: "Lato", fontSize: "20px", fontWeight: "700" }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "12px",
                fontWeight: "400",
                color: "var(--text3)",
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Stack>
      </Stack>
      <Stack flexDirection="row" gap="15px" alignItems="center">
        {search && <SearchBox value={searchValue} onChange={onSearchChange} />}
        <Stack flexDirection="row" gap="10px" alignItems="center">
          {button.map((buttons, index) => (
            <Stack key={index}>{buttons}</Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
