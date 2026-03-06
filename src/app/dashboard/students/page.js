"use client";
import FilterSideNav from "@/src/components/FilterSideNav/FilterSideNav";
import StudentsHeader from "./Components/StudentsHeader";
import { Box, Skeleton, Stack, TablePagination, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import StudentCard from "./Components/StudentCard";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";

export default function Students() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
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
      type: "chip",
      options: [
        { label: "All", value: "" },
        { label: "Active", value: "active", color: "#4CAF50" },
        { label: "Deactivated", value: "deactivated", color: "#F44336" },
      ],
    },
    {
      name: "gender",
      label: "Gender",
      type: "chip",
      options: [
        { label: "All", value: "" },
        { label: "Male", value: "Male", color: "#2196F3" },
        { label: "Female", value: "Female", color: "#E91E63" },
        { label: "Other", value: "Other", color: "#9C27B0" },
      ],
    },
    {
      name: "emailVerified",
      label: "Email Verified",
      type: "chip",
      options: [
        { label: "All", value: "" },
        { label: "Verified", value: "true", color: "#4CAF50" },
        { label: "Unverified", value: "false", color: "#FF9800" },
      ],
    },
  ];

  const filterOpen = () => setIsOpen(!isOpen);

  const toggleDrawer = (open) => (event) => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) return;
    setIsOpen(open);
  };

  const fetchStudentList = useCallback(
    async (signal) => {
      setIsLoading(true);
      const url = new URL(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/get-all-users`
      );
      if (searchQuery) url.searchParams.append("search", searchQuery);
      if (filters.status) url.searchParams.append("status", filters.status);
      if (filters.gender) url.searchParams.append("gender", filters.gender);
      if (filters.emailVerified) url.searchParams.append("emailVerified", filters.emailVerified);

      url.searchParams.append("page", currentPage + 1);
      url.searchParams.append("limit", rowsPerPage);

      try {
        const abortSignal = signal instanceof AbortSignal ? signal : null;
        const data = await apiFetch(url.toString(), { signal: abortSignal });
        if (data.success) {
          setStudentList(data.data);
          if (data.pagination) {
            setTotalItems(data.pagination.totalItems);
            setStats({
              total: data.pagination.totalItems,
              verified: data.pagination.totalVerified,
              active: data.pagination.totalActive,
            });
          }
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching students:", error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, rowsPerPage, searchQuery, filters]
  );

  useEffect(() => {
    const controller = new AbortController();
    const delayDebounceFn = setTimeout(() => {
      fetchStudentList(controller.signal);
    }, 500);

    return () => {
      clearTimeout(delayDebounceFn);
      controller.abort();
    };
  }, [fetchStudentList]);

  const handleChangePage = (event, newPage) => setCurrentPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  return (
    <Stack padding="20px" gap="16px">
      <StudentsHeader
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        onFilterClick={filterOpen}
        onAddClick={() => {}}
        stats={stats}
        isLoading={isLoading}
        hasActiveFilters={Object.values(filters).some((v) => v)}
        onClearFilters={() => setFilters({})}
      />
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
          border: "1px solid var(--border-color)",
          borderRadius: "10px",
          padding: "12px",
          gap: "0px",
          minHeight: "70vh",
        }}
      >
        {/* Table Header */}
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            padding: "6px 12px",
            gap: "12px",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "var(--text4)", textTransform: "uppercase", minWidth: "24px", textAlign: "center" }}>#</Typography>
          <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "var(--text4)", textTransform: "uppercase", minWidth: "200px", flex: 1.2 }}>Student</Typography>
          <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "var(--text4)", textTransform: "uppercase", minWidth: "100px", display: { xs: "none", md: "block" } }}>Phone</Typography>
          <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "var(--text4)", textTransform: "uppercase", minWidth: "50px", textAlign: "center", display: { xs: "none", lg: "block" } }}>Gender</Typography>
          <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "var(--text4)", textTransform: "uppercase", minWidth: "60px", textAlign: "center", display: { xs: "none", lg: "block" } }}>Joined</Typography>
          <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "var(--text4)", textTransform: "uppercase", minWidth: "140px", textAlign: "right" }}>Status</Typography>
        </Stack>

        {/* Student Rows */}
        <Stack>
          {!isLoading ? (
            studentList.length > 0 ? (
              studentList.map((item, index) => (
                <StudentCard key={index} user={item} index={index} />
              ))
            ) : (
              <Stack width="100%" minHeight="40vh">
                <NoDataFound info="No Students here" />
              </Stack>
            )
          ) : (
            Array.from({ length: 8 }).map((_, i) => (
              <Stack key={i} direction="row" alignItems="center" gap="12px" sx={{ padding: "7px 12px" }}>
                <Skeleton variant="text" width={24} height={16} />
                <Skeleton variant="rounded" width={30} height={30} sx={{ borderRadius: "8px" }} />
                <Stack gap="2px" flex={1}>
                  <Skeleton variant="text" width={120} height={14} />
                  <Skeleton variant="text" width={150} height={10} />
                </Stack>
                <Skeleton variant="text" width={80} height={14} sx={{ display: { xs: "none", md: "block" } }} />
                <Skeleton variant="rounded" width={50} height={20} sx={{ borderRadius: "10px" }} />
              </Stack>
            ))
          )}
        </Stack>

        {/* Pagination */}
        <Stack sx={{ marginTop: "auto", borderTop: "1px solid var(--border-color)" }}>
          <TablePagination
            component="div"
            count={totalItems}
            page={currentPage}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            sx={{
              "& .MuiTablePagination-toolbar": { minHeight: "40px" },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                fontSize: "12px",
              },
            }}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
