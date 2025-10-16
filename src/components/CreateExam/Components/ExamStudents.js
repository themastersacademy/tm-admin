"use client";
import { Button, Skeleton, Stack } from "@mui/material";
import * as XLSX from "xlsx";
import StudentProgressCard from "./StudentProgressCard";
import StatusCard from "./StatusCard";
import SearchBox from "../../SearchBox/SearchBox";
import { FilterAlt, Logout } from "@mui/icons-material";
import FilterSideNav from "../../FilterSideNav/FilterSideNav";
import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useParams } from "next/navigation";

export default function ExamStudents({ examAttempts, setExamAttempts }) {
  const { examID } = useParams();
  const [isLoading, setIsLoading] = useState(
    examAttempts.length === 0 ? true : false
  );
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({});

  const filtersConfig = [
    {
      name: "difficulty",
      label: "Difficulty",
      options: [
        {
          label: "All",
          value: "All",
        },
        {
          label: "Easy",
          value: "easy",
        },
      ],
    },
    {
      name: "type",
      label: "Type",
      options: [
        {
          label: "All",
          value: "All",
        },
        {
          label: "MCQ",
          value: "MCQ",
        },
      ],
    },
  ];

  const filterOpen = () => {
    setIsOpen(!isOpen);
  };
  const handleExport = () => {
    // 1. Map over the JSON data to create a flat structure for the Excel sheet
    // This structure mirrors the props of your StudentProgressCard
    const dataToExport = examAttempts.map((item) => ({
      Name: item.userMeta?.name,
      Email: item.userMeta?.email,
      "Exam Name": item.title,
      College: item.batchMeta?.instituteMeta?.title,
      Batch: item.batchMeta?.title,
      Status: item.status,
      "Date & Time": new Date(item.startTimeStamp).toLocaleString(),
      Marks: `${item.obtainedMarks} / ${item.totalMarks}`,
      "Percentage (%)": ((item.obtainedMarks / item.totalMarks) * 100).toFixed(
        2
      ),
    }));

    // 2. Create a new workbook and a worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // 3. Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

    // 4. Trigger the download
    XLSX.writeFile(workbook, `${dataToExport[0]["Exam Name"]}.xlsx`);
  };

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setIsOpen(open);
  };

  const fetchExamAttempts = useCallback(async () => {
    setIsLoading(true);
    if (examAttempts.length === 0) {
      try {
        const response = await apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/${examID}/get-exam-attempts`
        );
        if (response.success) {
          setExamAttempts(response.data);
        }
      } catch (error) {}
    } else {
      setIsLoading(false);
    }
  }, [examAttempts, examID, setExamAttempts]);

  useEffect(() => {
    fetchExamAttempts();
  }, [fetchExamAttempts]);

  return (
    <Stack marginTop="20px" gap="30px" padding="10px">
      <Stack flexDirection="row" justifyContent="space-between">
        <Stack flexDirection="row" gap="20px">
          <StatusCard icon title="Attempted" count={examAttempts.length} />
          <StatusCard
            icon
            title="Completed"
            count={
              examAttempts.filter((item) => item.status === "COMPLETED").length
            }
          />
          {/* <StatusCard icon title="Unattempted" count={examAttempts.filter(item => item.status === "unattempted").length} /> */}
        </Stack>
        <Stack justifyContent="space-between">
          <SearchBox />
          <Stack flexDirection="row" marginLeft="auto" gap="20px">
            <Button
              variant="contained"
              endIcon={<Logout sx={{ transform: "rotate(-90deg)" }} />}
              sx={{
                textTransform: "none",
                fontFamily: "Lato",
                fontSize: "14px",
                backgroundColor: "var(--sec-color)",
              }}
              disableElevation
              onClick={handleExport}
            >
              Export
            </Button>
            <Button
              variant="contained"
              endIcon={<FilterAlt />}
              onClick={filterOpen}
              sx={{
                backgroundColor: "var(--primary-color)",
                textTransform: "none",
                borderRadius: "4px",
              }}
              disableElevation
            >
              Filters
            </Button>
          </Stack>
        </Stack>
      </Stack>
      <FilterSideNav
        isOpen={isOpen}
        toggleDrawer={toggleDrawer}
        filtersConfig={filtersConfig}
        setFilters={setFilters}
        filters={filters}
      />
      <Stack flexDirection="row" flexWrap="wrap" gap="20px">
        {!isLoading
          ? examAttempts.length > 0
            ? examAttempts.map((item, index) => {
                return (
                  item.type === "scheduled" && (
                    <StudentProgressCard
                      key={index}
                      name={item.userMeta?.name}
                      email={item.userMeta?.email}
                      image={item.userMeta?.image}
                      status={item.status}
                      time={new Date(item.startTimeStamp).toLocaleDateString()}
                      college={item.batchMeta?.instituteMeta?.title}
                      year={item.batchMeta?.title}
                      examName={item?.title}
                      marks={`${item?.obtainedMarks}/${item?.totalMarks}`}
                      percent={`${(
                        (item.obtainedMarks / item.totalMarks) *
                        100
                      ).toFixed(0)}%`}
                    />
                  )
                );
              })
            : ""
          : Array.from({ length: 5 }).map((_, index) => (
              <StudentCardSkeleton key={index} />
            ))}
      </Stack>
    </Stack>
  );
}

function StudentCardSkeleton() {
  return (
    <Stack
      flexDirection="row"
      padding="10px"
      alignItems="center"
      gap="10px"
      width="100%"
      sx={{
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        minHeight: "80px",
      }}
    >
      <Stack flexDirection="row" alignItems="center" gap="30px">
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{ width: "50px", height: "50px", borderRadius: "10px" }}
        />
        <Stack flexDirection="column" gap="5px">
          <Skeleton variant="text" animation="wave" sx={{ width: "100px" }} />
          <Skeleton variant="text" animation="wave" sx={{ width: "160px" }} />
        </Stack>
        <Stack
          flexDirection="column"
          alignItems="center"
          gap="10px"
          marginLeft="70px"
        >
          <Skeleton
            variant="text"
            animation="wave"
            sx={{ width: "100px", marginLeft: "auto" }}
          />
          <Skeleton
            variant="text"
            animation="wave"
            sx={{ width: "100px", marginLeft: "auto" }}
          />
        </Stack>
        <Stack
          flexDirection="column"
          // alignItems="center"
          gap="10px"
          marginLeft="10px"
        >
          <Skeleton variant="text" animation="wave" sx={{ width: "350px" }} />
          <Skeleton variant="text" animation="wave" sx={{ width: "80px" }} />
        </Stack>
      </Stack>
      <Skeleton
        variant="text"
        animation="wave"
        sx={{ width: "30px", marginLeft: "50px" }}
      />
      <Skeleton variant="text" animation="wave" sx={{ width: "80px" }} />
      <Skeleton
        variant="rectangular"
        animation="wave"
        sx={{
          width: "100px",
          height: "30px",
          borderRadius: "20px",
          marginLeft: "auto",
        }}
      />
    </Stack>
  );
}
