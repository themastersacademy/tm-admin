import { TriangleAlert } from "lucide-react";
import { Stack, Typography } from "@mui/material";

const Page = () => {
  return (
    <Stack
      flexDirection={"column"}
      gap={3}
      alignItems={"center"}
      justifyContent={"center"}
      textAlign={"center"}
      sx={{
        bgcolor: "black",
        color: "white",
        height: "100vh",
        p: 4,
      }}
    >
      <TriangleAlert
        style={{
          width: "48px",
          height: "48px",
          color: "#9F6000",
        }}
      />
      <Typography
        variant="h1"
        sx={{
          fontSize: "24px",
          fontWeight: "800",
          color: "#9F6000",
        }}
      >
        Website Not Accessible on Mobile Devices
      </Typography>
      <p>
        Sorry😢, our website is not accessible on mobile devices. Please use a
        desktop or laptop to access the site.
      </p>
    </Stack>
  );
};

export default Page;
