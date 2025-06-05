import { styled } from "@mui/material";
import { Switch } from "@mui/material";

const StyledSwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase": {
    color: "var(--sec-color-acc-1)",
    transition: "all 0.2s ease-in-out",
    backgroundColor: "transparent",
    "&.Mui-checked": {
      color: "var(--sec-color)",
      backgroundColor: "transparent",
    },
    "&.Mui-checked + .MuiSwitch-track": {
      backgroundColor: "var(--sec-color)",
    },
  },
  "& .MuiSwitch-track": {
    backgroundColor: "var(--sec-color)",
  },
}));

export default StyledSwitch;
