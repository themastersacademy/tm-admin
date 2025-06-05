"use client";
import { Box, Stack, styled, Tab, Tabs } from "@mui/material";
import PropTypes from "prop-types";
import Syllabus from "../Syllabus";
import Exam from "../Exam";
import Info from "../Info";
import { useRouter, useSearchParams } from "next/navigation";

const StyledTabs = styled(Tabs)({
  backgroundColor: "var(--white)",
  borderRadius: "10px",
  width: "308px",
  padding: "4px",
  minHeight: "40px",
  "& .MuiTabs-indicator": {
    display: "none",
  },
});

const StyledTab = styled(Tab)({
  textTransform: "none",
  fontFamily: "Lato",
  fontWeight: 600,
  borderRadius: "8px",
  width: "100px",
  transition: "all 0.2s ease",
  minHeight: "32px",
  padding: "0px",
  "&.Mui-selected": {
    color: "var(--sec-color)",
    backgroundColor: "var(--sec-color-acc-1)",
  },
});

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

export default function GoalTabs({ tabs, goal, fetchGoal, goalLoading }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const value = tab ? parseInt(tab) : 0;

  const handleChange = (event, newValue) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", newValue);
    router.push(`/dashboard/goals/${goal.goalID}?${params.toString()}`);
  };
  return (
    <Stack gap="18px">
      <StyledTabs value={value} onChange={handleChange}>
        {tabs.map((tab, index) => (
          <StyledTab key={index} label={tab.label} />
        ))}
      </StyledTabs>
      <CustomTabPanel value={value} index={0}>
        <Syllabus goal={goal} fetchGoal={fetchGoal} goalLoading={goalLoading} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Exam goal={goal} fetchGoal={fetchGoal} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <Info goal={goal} fetchGoal={fetchGoal} />
      </CustomTabPanel>
    </Stack>
  );
}
