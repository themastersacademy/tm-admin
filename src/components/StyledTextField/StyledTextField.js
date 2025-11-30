import { TextField } from "@mui/material";
import { styled } from "@mui/system";

const StyledTextField = styled(TextField)(() => ({
  width: "100%",
  "& .MuiOutlinedInput-root": {
    height: "40px",
    borderRadius: "5px",
    fontFamily: "Lato",
    fontWeight: "400",
    fontSize: "16px",
    "&.Mui-focused fieldset": {
      borderColor: "var(--primary-color)",
      borderWidth: "1px",
    },
    "&:hover fieldset": {
      borderColor: "var(--primary-color)",
    },
  },
  "& .MuiInputBase-input": {
    padding: "8px 14px !important",
  },
  "& .MuiInputBase-input::placeholder": {
    color: "var(--text3)",
    opacity: 1,
  },
  "& .MuiAutocomplete-input": {
    padding: "0 !important",
  },
}));

export default StyledTextField;
