"use client";
import CustomPagination from "@/src/components/CustomPagination/CustomPagination";
import FilterSideNav from "@/src/components/FilterSideNav/FilterSideNav";
import Header from "@/src/components/Header/Header";
import {
  Add,
  FilterAlt,
  Group,
  VerifiedUser,
  CheckCircle,
} from "@mui/icons-material";
import { Button, Stack, Typography, TablePagination } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import StudentCard from "@/src/components/StudentCard/StudentCard";
import UserCardSkeleton from "@/src/components/UserCardSkeleton/UserCardSkeleton";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";

export default function Students() {
  const router = useRouter();
  const page = router.query;
  // const totalPages = 10; // Removed hardcoded
  const [currentPage, setCurrentPage] = useState(0); // TablePagination is 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({ total: 0, verified: 0, active: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [studentList, setStudentList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filtersConfig = [
    {
      name: "status",
      label: "Status",
      options: [
        { label: "All", value: "" },
        { label: "Active", value: "active" },
        { label: "Deactivated", value: "deactivated" },
      ],
    },
    {
      name: "gender",
      label: "Gender",
      options: [
        { label: "All", value: "" },
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
        { label: "Other", value: "Other" },
      ],
    },
    {
      name: "emailVerified",
      label: "Email Verified",
      options: [
        { label: "All", value: "" },
        { label: "Verified", value: "true" },
        { label: "Unverified", value: "false" },
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
    const url = new URL(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/get-all-users`
    );
    if (searchQuery) {
      url.searchParams.append("search", searchQuery);
    }
    if (filters.status) url.searchParams.append("status", filters.status);
    if (filters.gender) url.searchParams.append("gender", filters.gender);
    if (filters.emailVerified)
      url.searchParams.append("emailVerified", filters.emailVerified);

    url.searchParams.append("page", currentPage + 1); // Backend expects 1-indexed
    url.searchParams.append("limit", rowsPerPage);

    await apiFetch(url.toString()).then((data) => {
      if (data.success) {
        setStudentList(data.data);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setTotalItems(data.pagination.totalItems);
          setStats({
            total: data.pagination.totalItems,
            verified: data.pagination.totalVerified,
            active: data.pagination.totalActive,
          });
        }
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudentList();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, rowsPerPage, searchQuery, filters]);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  return (
    <Stack padding="20px" gap="20px">
      <Header
        title="Students"
        search
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        button={[
          <Button
            key="Add"
            variant="contained"
            startIcon={<Add />}
            sx={{
              backgroundColor: "var(--primary-color)",
              textTransform: "none",
            }}
            disableElevation
          >
            Students
          </Button>,
          <Button
            key="Filter"
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
      <Stack flexDirection="row" gap="20px" flexWrap="wrap">
        <SecondaryCard
          icon={<Group sx={{ color: "var(--primary-color)" }} />}
          title="Total Students"
          subTitle={stats.total}
          cardWidth="200px"
        />
        <SecondaryCard
          icon={<VerifiedUser sx={{ color: "var(--primary-color)" }} />}
          title="Verified Students"
          subTitle={stats.verified}
          cardWidth="200px"
        />
        <SecondaryCard
          icon={<CheckCircle sx={{ color: "var(--primary-color)" }} />}
          title="Active Students"
          subTitle={stats.active}
          cardWidth="200px"
        />
      </Stack>
      <FilterSideNav
        isOpen={isOpen}
        toggleDrawer={toggleDrawer}
        filtersConfig={filtersConfig}
        setFilters={setFilters}
        filters={filters}
        onApply={() => {
          fetchStudentList();
          setIsOpen(false);
        }}
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
          <TablePagination
            component="div"
            count={totalItems}
            page={currentPage}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
