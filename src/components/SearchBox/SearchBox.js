import { Search } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField } from "@mui/material";

export default function SearchBox({ value, onChange }) {
  return (
    <TextField
      value={value}
      onChange={onChange}
      sx={{
        width: "100%",
        "& .MuiOutlinedInput-root": {
          height: "40px",
          borderRadius: "5px",
          fontFamily: "Lato",
          fontWeight: "400",
          fontSize: "16px",
          backgroundColor: "var(--white)",
          "&.Mui-focused fieldset": {
            borderColor: "var(--sec-color)",
            borderWidth: "1px",
          },
          "&:hover fieldset": {
            borderColor: "var(--sec-color)",
          },
        },
      }}
      placeholder="Search"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton>
              <Search fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
      // onFocus={(e) => {
      //   e.stopPropagation();
      //   e.target.select();
      // }}
    ></TextField>
  );
}
