"use client";
import { Box, Stack, styled, Tab, Tabs, CircularProgress } from "@mui/material";
import PropTypes from "prop-types";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const TabLoading = () => (
  <Stack
    alignItems="center"
    justifyContent="center"
    sx={{ minHeight: "200px", width: "100%" }}
  >
    <CircularProgress />
  </Stack>
);

const Syllabus = dynamic(
  () => import("@/src/app/dashboard/goals/[id]/components/Syllabus"),
  { loading: () => <TabLoading /> }
);
const Exam = dynamic(
  () => import("@/src/app/dashboard/goals/[id]/components/Exam"),
  { loading: () => <TabLoading /> }
);
const Info = dynamic(
  () => import("@/src/app/dashboard/goals/[id]/components/Info"),
  { loading: () => <TabLoading /> }
);

const StyledTabs = styled(Tabs)({
  backgroundColor: "var(--white)",
  borderRadius: "10px",
  border: "1px solid var(--border-color)",
  width: "fit-content",
  padding: "3px",
  minHeight: "36px",
  "& .MuiTabs-indicator": {
    display: "none",
  },
});

const StyledTab = styled(Tab)({
  textTransform: "none",
  fontFamily: "Lato",
  fontWeight: 600,
  fontSize: "13px",
  borderRadius: "7px",
  minWidth: "100px",
  transition: "all 0.15s ease",
  minHeight: "30px",
  padding: "4px 16px",
  color: "var(--text3)",
  "&.Mui-selected": {
    color: "var(--primary-color)",
    backgroundColor: "var(--primary-color-acc-2)",
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
    <Stack gap="16px">
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
