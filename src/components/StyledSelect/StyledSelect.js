import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import NoDataFound from "../NoDataFound/NoDataFound";

export default function StyledSelect({
  title,
  value,
  onChange,
  options = [],
  getLabel = (option) => option?.title,
  getValue = (option) => option?.id,
  disable,
}) {
  return (
    <FormControl
      sx={{
        width: "100%",
      }}
      size="small"
      disabled={disable}
    >
      <InputLabel
        sx={{
          "&.Mui-focused": {
            color: "var(--sec-color)",
          },
        }}
      >
        {title}
      </InputLabel>
      <Select
        label={title}
        size="small"
        value={value }
        onChange={onChange}
        MenuProps={{ disableScrollLock: true }}
        sx={{
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--sec-color)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--sec-color)",
          },
        }}
      >
        {options.length > 0 ? (
          options.map((option, index) => {
            return (
              <MenuItem key={index} value={getValue(option)}>
                {getLabel(option)}
              </MenuItem>
            );
          })
        ) : (
          <MenuItem>No data found</MenuItem>
        )}
      </Select>
    </FormControl>
  );
}
