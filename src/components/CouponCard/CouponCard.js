"use client";
import { Delete, Edit } from "@mui/icons-material";
import { Card, Chip, IconButton, Stack, Typography } from "@mui/material";
import Image from "next/image";
import studentcard from "@/public/Icons/studentcard.svg";

export default function CouponCard({
  name = "",
  duration = "",
  price = "",
  discount = "",
  code = "",
  subscriptionType = "",
  status = "",
  redems = "",
  edit = () => {},
  deleteCoupon = () => {},
}) {
  return (
    <Card
      sx={{
        width: "450px",
        minHeight: "200px",
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        padding: "16px",
      }}
      elevation={0}
    >
      <Stack justifyContent="space-between" spacing={2}>
        <Stack flexDirection="row" alignItems="center" gap="20px">
          <Stack
            sx={{
              width: "62px",
              height: "62px",
              backgroundColor: "var(--sec-color-acc-1)",
              borderRadius: "10px",
              justifyContent: "center",
              alignItems: "center",
              flexShrink: 0,
              flexDirection: "row",
            }}
          >
            <Image src={studentcard.src} alt="icon" width={24} height={24} />
          </Stack>

          <Stack flex={1} spacing={1} minWidth={0}>
            <Typography sx={titleStyle} noWrap>
              {name}
            </Typography>

            <Stack
              flexDirection="row"
              width="300px"
              alignItems="center"
              gap="20px"
            >
              <Typography sx={subTextStyle} noWrap>
                {duration}
              </Typography>
              <Typography sx={labelStyle}>{subscriptionType}</Typography>
            </Stack>
          </Stack>
        </Stack>
        <Stack flexDirection="row" alignItems="center" gap="20px">
          <Stack flex={1} spacing={1} minWidth={0}>
            <Typography sx={primaryTextStyle}>{discount}</Typography>
            <Typography sx={primaryTextStyle}>{code}</Typography>
          </Stack>

          <Stack flex={1} spacing={1}>
            <Typography sx={titleStyle}>{price}</Typography>
            <Typography sx={highlightTextStyle}>{redems}</Typography>
          </Stack>
        </Stack>

        <Stack direction="row" alignItems="center">
          <Chip
            label={status}
            sx={{
              fontFamily: "Lato",
              fontSize: "12px",
              backgroundColor: "var(--primary-color-acc-2)",
              color: "var(--primary-color)",
              width: "100px",
            }}
          />
          <Stack flexDirection="row" gap="5px" marginLeft="auto">
            <IconButton onClick={deleteCoupon}>
              <Delete sx={{ color: "var(--delete-color)" }} />
            </IconButton>
            <IconButton onClick={edit}>
              <Edit sx={{ color: "var(--primary-color)" }} />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

const titleStyle = {
  fontFamily: "Lato",
  fontSize: "14px",
  fontWeight: "700",
  color: "var(--text1)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const subTextStyle = {
  fontFamily: "Lato",
  fontSize: "14px",
  color: "var(--text1)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const labelStyle = {
  fontFamily: "Lato",
  fontSize: "14px",
  fontWeight: "400",
  color: "var(--text3)",
};

const primaryTextStyle = {
  fontFamily: "Lato",
  fontSize: "14px",
  fontWeight: "700",
  color: "var(--primary-color)",
};

const highlightTextStyle = {
  fontFamily: "Lato",
  fontSize: "14px",
  fontWeight: "700",
  color: "var(--sec-color)",
};
