"use client";
import { DesktopDateTimePicker } from "@mui/x-date-pickers/DesktopDateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useState } from "react";

export default function DatePicker({ data, setData, updateData, field }) {
  const initialValue =
    field === "startTimeStamp" ? data.startTimeStamp : data.endTimeStamp;

  const [selectedDate, setSelectedDate] = useState(() =>
    dayjs(initialValue).isValid() ? dayjs(initialValue) : dayjs()
  );

  const handleAccept = (newValue) => {
    const timestamp = new Date(newValue).getTime();
    setData((prev) => ({ ...prev, [field]: timestamp }));
    updateData({ params: { [field]: timestamp } });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DesktopDateTimePicker
        value={selectedDate}
        onChange={setSelectedDate}
        onAccept={handleAccept}
        slotProps={{
          textField: {
            sx: {
              width: "600px",
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "var(--sec-color)" },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--sec-color)",
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "var(--sec-color)",
              },
            },
            size: "small",
          },
          popper: {
            sx: {
              width: "505px",
              "& .MuiPaper-root": {
                marginTop: "10px",
                borderRadius: "6px",
                border: "1px solid var(--sec-color)",
              },
              "& .MuiPickersDay-root": {
                color: "var(--primary-color)",
                fontSize: "16px",
              },
              "& .MuiPickersDay-root.Mui-selected": {
                backgroundColor: "var(--sec-color) !important",
                color: "var(--white)",
              },
              "& .MuiButtonBase-root.MuiMenuItem-root": {
                backgroundColor: "var(--sec-color-acc-2)",
                color: "var(--text3)",
                "&.Mui-selected": {
                  backgroundColor: "var(--sec-color)",
                  color: "#fff",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "var(--sec-color)",
                },
                "&:hover": {
                  backgroundColor: "var(--sec-color-acc-1)",
                },
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
}
