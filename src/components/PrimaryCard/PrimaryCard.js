import { TrendingFlat } from "@mui/icons-material";
import { Button, Card, Chip, Stack, Typography } from "@mui/material";
import Image from "next/image";

export default function PrimaryCard({
  icon,
  title,
  actionButton,
  subtitle,
  onClick,
  isLive,
}) {
  return (
    <Card
      sx={{
        width: "160px",
        height: "210px",
        border: "1px solid",
        borderColor: "var(--border-color)",
        padding: "20px 0px 20px 0px",
        borderRadius: "10px",
        position: "relative",
      }}
      elevation={0}
    >
      {isLive  && (
        <Chip
          size="small"
          label={isLive}
          sx={{
            borderRadius: "0px 8px",
            position: "absolute",
            top: "0px",
            right: "0px",
            backgroundColor: "var(--primary-color)",
            color: "var(--white)",
          }}
        />
      )}

      <Stack
        justifyContent="space-between"
        alignItems="center"
        sx={{ height: "185px" }}
      >
        <Stack alignItems="center" gap="7px">
          <Stack
            sx={{
              width: "75px",
              height: "75px",
              backgroundColor: "var(--sec-color-acc-1)",
              borderRadius: "15px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image src={icon} alt={title} width={26} height={30} />
          </Stack>
          <Typography
            sx={{ fontFamily: "Lato", fontSize: "14px", fontWeight: "700" }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "12px",
                fontWeight: "400",
                color: "var(--text4)",
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Stack>
        <Button
          variant="text"
          endIcon={<TrendingFlat />}
          onClick={onClick}
          sx={{
            width: "87px",
            fontFamily: "Lato",
            fontSize: "12px",
            fontWeight: "400",
            textTransform: "none",
            color: "var(--primary-color)",
            "&:hover": {
              backgroundColor: "transparent",
            },
          }}
        >
          {actionButton}
        </Button>
      </Stack>
    </Card>
  );
}
