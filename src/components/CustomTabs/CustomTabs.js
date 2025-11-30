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
  minHeight: "56px",
  position: "relative",
  borderBottom: "2px solid var(--border-color)",
  ...customstyles?.tabs,
  "& .MuiTabs-indicator": {
    height: "3px",
    borderRadius: "3px 3px 0 0",
    background:
      "linear-gradient(90deg, var(--primary-color) 0%, rgba(var(--primary-rgb), 0.7) 100%)",
    boxShadow: "0 -2px 8px rgba(var(--primary-rgb), 0.3)",
  },
  "& .MuiTabs-flexContainer": {
    gap: "8px",
  },
}));

const StyledTab = styled(Tab)(({ customstyles }) => ({
  textTransform: "none",
  fontFamily: "Lato",
  fontWeight: 600,
  fontSize: "15px",
  color: "var(--text2)",
  borderRadius: "0px",
  minWidth: "120px",
  maxWidth: "200px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  minHeight: "56px",
  padding: "12px 24px",
  whiteSpace: "nowrap",
  position: "relative",
  letterSpacing: "0.3px",
  "&.Mui-selected": {
    color: "var(--primary-color)",
    fontWeight: 700,
    "& .tab-icon": {
      transform: "scale(1.1)",
    },
  },
  "&:hover:not(.Mui-selected)": {
    color: "var(--text1)",
    backgroundColor: "rgba(var(--primary-rgb), 0.04)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "3px",
    backgroundColor: "transparent",
    transition: "background-color 0.3s ease",
  },
  "&.Mui-selected::before": {
    backgroundColor: "transparent",
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
      {value === index && (
        <Box
          sx={{
            marginTop: "24px",
            animation: "fadeIn 0.3s ease-in-out",
            "@keyframes fadeIn": {
              from: { opacity: 0, transform: "translateY(8px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          {children}
        </Box>
      )}
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
            sx={{ cursor: "pointer" }}
            onClick={() => {
              router.back();
            }}
          />
        )}

        <Stack
          sx={{
            backgroundColor: "var(--white)",
            borderRadius: "12px 12px 0 0",
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
          borderRadius: "0 0 12px 12px",
          padding: "24px",
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
