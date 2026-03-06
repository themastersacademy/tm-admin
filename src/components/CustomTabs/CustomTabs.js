"use client";
import { ArrowBackIos } from "@mui/icons-material";
import { Box, Stack, styled, Tab, Tabs } from "@mui/material";
import { useRouter } from "next/navigation";
import PropTypes from "prop-types";
import { useState } from "react";

const StyledTabs = styled(Tabs)(({ customstyles, width }) => ({
  backgroundColor: "transparent",
  borderRadius: "0px",
  width: width,
  padding: "0px",
  minHeight: "40px",
  position: "relative",
  borderBottom: "2px solid var(--border-color)",
  ...customstyles?.tabs,
  "& .MuiTabs-indicator": {
    height: "2px",
    borderRadius: "2px 2px 0 0",
    backgroundColor: "var(--primary-color)",
  },
  "& .MuiTabs-flexContainer": {
    gap: "4px",
  },
}));

const StyledTab = styled(Tab)(({ customstyles }) => ({
  textTransform: "none",
  fontFamily: "Lato",
  fontWeight: 600,
  fontSize: "13px",
  color: "var(--text3)",
  borderRadius: "0px",
  minWidth: "unset",
  maxWidth: "180px",
  transition: "all 0.2s ease",
  minHeight: "40px",
  padding: "8px 16px",
  whiteSpace: "nowrap",
  position: "relative",
  letterSpacing: "0.2px",
  "&.Mui-selected": {
    color: "var(--primary-color)",
    fontWeight: 700,
  },
  "&:hover:not(.Mui-selected)": {
    color: "var(--text1)",
    backgroundColor: "rgba(24, 113, 99, 0.04)",
  },
  ...customstyles?.tab,
}));

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

export default function CustomTabs({
  tabs,
  customstyles,
  width,
  back,
  onChange,
}) {
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (onChange) {
      onChange(event, newValue);
    }
  };
  const router = useRouter();

  return (
    <Stack>
      <Stack flexDirection="row" alignItems="center">
        {back && (
          <ArrowBackIos
            sx={{ cursor: "pointer", fontSize: "18px" }}
            onClick={() => {
              router.back();
            }}
          />
        )}

        <Stack
          sx={{
            backgroundColor: "var(--white)",
            borderRadius: "10px 10px 0 0",
            border: "1px solid var(--border-color)",
            borderBottom: "none",
            overflow: "hidden",
            width: width,
          }}
        >
          <StyledTabs
            value={value}
            onChange={handleChange}
            customstyles={customstyles}
            width={width}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            {tabs.map((tab, index) => (
              <StyledTab
                key={index}
                label={tab.label}
                customstyles={customstyles}
              />
            ))}
          </StyledTabs>
        </Stack>
      </Stack>

      <Stack
        sx={{
          backgroundColor: "var(--white)",
          border: "1px solid var(--border-color)",
          borderTop: "none",
          borderRadius: "0 0 10px 10px",
          padding: "16px",
          minHeight: "400px",
        }}
      >
        {tabs.map((tab, index) => (
          <CustomTabPanel key={index} value={value} index={index}>
            {tab.content}
          </CustomTabPanel>
        ))}
      </Stack>
    </Stack>
  );
}

CustomTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      content: PropTypes.node.isRequired,
    })
  ).isRequired,
  customstyles: PropTypes.shape({
    tabs: PropTypes.object,
    tab: PropTypes.object,
  }),
};
