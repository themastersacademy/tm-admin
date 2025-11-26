"use client";
import { ArrowBackIos } from "@mui/icons-material";
import { Box, Stack, styled, Tab, Tabs } from "@mui/material";
import { useRouter } from "next/navigation";
import PropTypes from "prop-types";
import { useState } from "react";

const StyledTabs = styled(Tabs)(({ customstyles, width }) => ({
  backgroundColor: "var(--white)",
  borderRadius: "10px",
  width: width,
  padding: "4px",
  minHeight: "40px",
  boxShadow: "inset .2px .1px 4px var(--border-color)",
  ...customstyles?.tabs,
  "& .MuiTabs-indicator": {
    display: "none",
  },
}));

const StyledTab = styled(Tab)(({ customstyles }) => ({
  textTransform: "none",
  fontFamily: "Lato",
  fontWeight: 600,
  borderRadius: "8px",
  width: "140px",
  transition: "all 0.4s ease",
  minHeight: "32px",
  padding: "0px",
  whiteSpace: "nowrap",
  "&.Mui-selected": {
    color: "var(--sec-color)",
    backgroundColor: "var(--sec-color-acc-1)",
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
      onchange(event, newValue);
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

        <StyledTabs
          value={value}
          onChange={handleChange}
          customstyles={customstyles}
          width={width}
        >
          {tabs.map((tab, index) => (
            <StyledTab
              // value={value}
              key={index}
              label={tab.label}
              customstyles={customstyles}
            />
          ))}
        </StyledTabs>
      </Stack>
      {tabs.map((tab, index) => (
        <CustomTabPanel key={index} value={value} index={index}>
          {tab.content}
        </CustomTabPanel>
      ))}
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
