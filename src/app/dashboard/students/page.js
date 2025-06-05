"use client";
import CustomPagination from "@/src/components/CustomPagination/CustomPagination";
import FilterSideNav from "@/src/components/FilterSideNav/FilterSideNav";
import Header from "@/src/components/Header/Header";
import { Add, FilterAlt } from "@mui/icons-material";
import { Button, MenuItem, Pagination, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import StudentCard from "@/src/components/StudentCard/StudentCard";
import UserCardSkeleton from "@/src/components/UserCardSkeleton/UserCardSkeleton";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";

// export const metadata = {
//   title:"Students",
// };

export default function Students() {
  const router = useRouter();
  const page = router.query;
  const totalPages = 10;
  const [currentPage, setCurrentPage] = useState(Number(page) || 1);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [studentList, setStudentList] = useState([]);
  const filtersConfig = [
    {
      name: "difficulty",
      label: "Difficulty",
      options: [
        {
          label: "All",
          value: "All",
        },
      ],
    },
  ];

  const filterOpen = () => {
    setIsOpen(!isOpen);
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

  const fetchStudentList = async () => {
    setIsLoading(true);
    await apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/get-all-users`
    ).then((data) => {
      if (data.success) {
        setStudentList(data.data);
      }
      setIsLoading(false);
    });
  };
  useEffect(() => {
    fetchStudentList();
    setCurrentPage(Number(page) || 1);
  }, [page]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <Stack padding="20px" gap="20px">
      <Header
        title="Students"
        search
        button={[
          <Button
            key="Add"
            variant="contained"
            startIcon={<Add />}
            // onClick={dialogOpen}
            sx={{
              backgroundColor: "var(--primary-color)",
              textTransform: "none",
            }}
            disableElevation
          >
            Students
          </Button>,
          <Button
            key="Add"
            variant="contained"
            endIcon={<FilterAlt />}
            onClick={filterOpen}
            sx={{
              backgroundColor: "var(--primary-color)",
              textTransform: "none",
            }}
            disableElevation
          >
            Filter
          </Button>,
        ]}
      />
      <FilterSideNav
        isOpen={isOpen}
        toggleDrawer={toggleDrawer}
        filtersConfig={filtersConfig}
        setFilters={setFilters}
        filters={filters}
        // onApply={handleApplyFilters}
      />
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
        <Stack gap="15px" flexDirection="row" flexWrap="wrap">
          {/* {!isLoading
            ? studentList.length > 0 &&
              studentList.map((item, index) => (
                <StudentCard key={index} user={item} />
              ))
            : Array.from({ length: 5 }).map((_, index) => (
                <UserCardSkeleton key={index} />
              ))} */}
          {!isLoading ? (
            studentList.length > 0 ? (
              studentList.map((item, index) => (
                <StudentCard key={index} user={item} />
              ))
            ) : (
              <Stack width="100%" minHeight="80vh">
                <NoDataFound info="No Students here" />
              </Stack>
            )
          ) : (
            Array.from({ length: 5 }).map((_, index) => (
              <UserCardSkeleton key={index} />
            ))
          )}
        </Stack>

        <Stack
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          gap="10px"
          sx={{
            width: "100%",
            marginTop: "auto",
          }}
        >
          <Typography
            sx={{ fontFamily: "Lato", fontSize: "13px", fontWeight: "400" }}
          >
            Total 85 items
          </Typography>
          <CustomPagination
            count={totalPages}
            page={currentPage}
            onPageChange={handlePageChange}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
