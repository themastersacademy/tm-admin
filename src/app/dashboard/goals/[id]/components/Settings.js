import DialogBox from "@/src/components/DialogBox/DialogBox";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { Add, PlaylistAddCheck, Close } from "@mui/icons-material";
import {
  Button,
  DialogContent,
  FormControl,
  InputLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

export default function Settings() {
  const menuOptions = ["Remove"];
  const [isDialogOpen, setIsDialogOPen] = useState(false);
  const dialogOpen = () => {
    setIsDialogOPen(true);
  };
  const dialogClose = () => {
    setIsDialogOPen(false);
  };
  const [selectType, setSelectType] = useState("");
  const [noOfType, setNoOfType] = useState("");
  const handleChangeSelect = (event) => {
    setSelectType(event.target.value);
  };
  const handleChangeNum = (event) => {
    setNoOfType(event.target.value);
  };
  return (
    <Stack
      sx={{
        backgroundColor: "var(--white)",
        border: "1px solid",
        borderColor: "var(--border-color)",
        borderRadius: "10px",
        padding: "20px",
        gap: "20px",
        minHeight: "100vh",
      }}
    >
      <Stack flexDirection="row" justifyContent="space-between">
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "16px",
            fontWeight: "700",
            color: "var(--text3)",
          }}
        >
          Subscription
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={dialogOpen}
          sx={{
            backgroundColor: "var(--primary-color)",
            textTransform: "none",
          }}
          disableElevation
        >
          Create
        </Button>
      </Stack>
      <Stack flexWrap="wrap" flexDirection="row" rowGap="20px" columnGap="50px">
        <SecondaryCard
          icon={
            <PlaylistAddCheck
              sx={{ color: "var(--primary-color)", fontSize: "30px" }}
            />
          }
          title="Monthly Subscription (1 month)"
          options={menuOptions}
          cardWidth="500px"
          subTitle="₹299"
        />
      </Stack>
      <DialogBox
        isOpen={isDialogOpen}
        onClose={dialogClose}
        title="Create Subscription"
        actionButton={
          <Button
            variant="contained"
            sx={{
              backgroundColor: "var(--primary-color)",
              textTransform: "none",
              width: "100%",
            }}
            disableElevation
          >
            Create
          </Button>
        }
        icon={
          <IconButton onClick={dialogClose}>
            <Close />
          </IconButton>
        }
      >
        <DialogContent sx={{ minHeight: "unset", paddingBottom: "20px" }}>
          <Stack gap="20px">
            <FormControl
              sx={{
                width: "100%",
              }}
              size="small"
            >
              <InputLabel
                sx={{
                  "&.Mui-focused": {
                    color: "var(--primary-color)",
                  },
                }}
              >
                Select type
              </InputLabel>
              <Select
                label="Select type"
                value={selectType}
                size="small"
                onChange={handleChangeSelect}
                sx={{
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--primary-color)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--primary-color)",
                  },
                }}
              >
                <MenuItem value="10">one</MenuItem>
                <MenuItem value="20">two</MenuItem>
                <MenuItem value="30">three</MenuItem>
              </Select>
            </FormControl>
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              gap="20px"
            >
              <FormControl sx={{ width: "50%" }} size="small">
                <InputLabel
                  sx={{
                    "&.Mui-focused": {
                      color: "var(--primary-color)",
                    },
                  }}
                >
                  No of type
                </InputLabel>
                <Select
                  label="No of type"
                  value={noOfType}
                  onChange={handleChangeNum}
                  sx={{
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "var(--primary-color)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "var(--primary-color)",
                    },
                  }}
                >
                  <MenuItem value="10">one</MenuItem>
                  <MenuItem value="20">two</MenuItem>
                  <MenuItem value="30">three</MenuItem>
                </Select>
              </FormControl>
              <StyledTextField
                placeholder="Enter Price"
                sx={{ width: "50%" }}
              />
            </Stack>
          </Stack>
        </DialogContent>
      </DialogBox>
    </Stack>
  );
}
