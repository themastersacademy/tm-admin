"use client";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import DeleteDialogBox from "@/src/components/DeleteDialogBox/DeleteDialogBox";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import { apiFetch } from "@/src/lib/apiFetch";
import { CreateNewFolder } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CourseBankHeader from "./components/CourseBankHeader";
import BankFolderCard from "./components/BankFolderCard";
import CreateBankDialog from "./components/CreateBankDialog";
import RenameBankDialog from "./components/RenameBankDialog";

export default function Coursebank() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [title, setTitle] = useState("");
  const [courseList, setCourseList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBankID, setselectedBankID] = useState(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortValue, setSortValue] = useState("newest");
  const ITEMS_PER_PAGE = 24;

  const dialogOpen = () => setIsDialogOpen(true);
  const dialogClose = () => setIsDialogOpen(false);

  const deleteDialogOpen = (bankID) => {
    setselectedBankID(bankID);
    setIsDeleteDialogOpen(true);
  };
  const deleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setselectedBankID(null);
  };

  const renameDialogOpen = (bank) => {
    setSelectedBank(bank);
    setIsRenameDialogOpen(true);
  };
  const renameDialogClose = () => {
    setIsRenameDialogOpen(false);
    setSelectedBank(null);
  };

  const fetchCourse = () => {
    setIsLoading(true);
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/bank/get-all-bank`).then(
      (data) => {
        if (data.success) {
          setCourseList(data.data.banks);
        } else {
          setCourseList([]);
        }
        setIsLoading(false);
      },
    );
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  // Reset page when search or sort changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortValue]);

  // Filter and sort
  const processedBanks = useMemo(() => {
    let result = [...courseList];

    if (searchQuery) {
      result = result.filter((bank) =>
        bank.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    result.sort((a, b) => {
      switch (sortValue) {
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "oldest":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case "a-z":
          return a.title.localeCompare(b.title);
        case "z-a":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return result;
  }, [courseList, searchQuery, sortValue]);

  const totalPages = Math.ceil(processedBanks.length / ITEMS_PER_PAGE);
  const paginatedBanks = useMemo(
    () =>
      processedBanks.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
      ),
    [processedBanks, page]
  );

  const bankDelete = () => {
    setIsLoading(true);
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/bank/delete/${selectedBankID}`,
    ).then((data) => {
      if (data.success) {
        fetchCourse();
        showSnackbar(data.message, "success", "", "3000");
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
      setIsLoading(false);
      deleteDialogClose();
    });
  };

  return (
    <Stack padding="20px" gap="24px">
      <CourseBankHeader
        title="Course Bank"
        totalCount={courseList.length}
        search
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        sortValue={sortValue}
        onSortChange={(e) => setSortValue(e.target.value)}
        actions={[
          {
            label: "New Folder",
            icon: <CreateNewFolder />,
            onClick: dialogOpen,
            sx: {
              backgroundColor: "var(--primary-color)",
              color: "white",
              "&:hover": { backgroundColor: "var(--primary-color-dark)" },
            },
          },
        ]}
      />

      <CreateBankDialog
        open={isDialogOpen}
        onClose={dialogClose}
        fetchCourse={fetchCourse}
      />

      <RenameBankDialog
        open={isRenameDialogOpen}
        onClose={renameDialogClose}
        bank={selectedBank}
        fetchCourse={fetchCourse}
      />

      <Stack
        sx={{
          border: "1px solid var(--border-color)",
          backgroundColor: "var(--white)",
          borderRadius: "16px",
          padding: "32px",
          minHeight: "75vh",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "20px",
            width: "100%",
            alignContent: "start",
          }}
        >
          {!isLoading ? (
            paginatedBanks.length > 0 ? (
              paginatedBanks.map((item, index) => (
                <BankFolderCard
                  key={item.bankID || index}
                  bank={item}
                  onDelete={deleteDialogOpen}
                  onRename={renameDialogOpen}
                />
              ))
            ) : (
              <Box sx={{ gridColumn: "1 / -1", height: "50vh" }}>
                <NoDataFound
                  info={
                    searchQuery
                      ? "No folders found matching your search"
                      : "No folders created yet"
                  }
                />
              </Box>
            )
          ) : (
            [...Array(8)].map((_, index) => (
              <SecondaryCardSkeleton key={index} variant="folder" />
            ))
          )}
        </Box>

        {totalPages > 1 && (
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            gap={1.5}
            mt={4}
            pt={3}
            borderTop="1px solid var(--border-color)"
          >
            <Typography
              sx={{ fontSize: "13px", color: "var(--text3)", fontWeight: 500 }}
            >
              Page {page} of {totalPages}
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => {
                setPage(value);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              shape="rounded"
              sx={{
                "& .MuiPaginationItem-root": {
                  fontWeight: 600,
                  fontSize: "14px",
                  minWidth: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  color: "var(--text2)",
                  border: "1px solid var(--border-color)",
                  "&:hover": {
                    backgroundColor: "rgba(24, 113, 99, 0.08)",
                    borderColor: "var(--primary-color)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "var(--primary-color)",
                    color: "white",
                    borderColor: "var(--primary-color)",
                    "&:hover": {
                      backgroundColor: "var(--primary-color-dark)",
                    },
                  },
                },
                "& .MuiPaginationItem-previousNext": {
                  border: "1px solid var(--border-color)",
                  "&:hover": {
                    backgroundColor: "rgba(24, 113, 99, 0.08)",
                    borderColor: "var(--primary-color)",
                  },
                },
              }}
            />
          </Stack>
        )}
      </Stack>

      <DeleteDialogBox
        isOpen={isDeleteDialogOpen}
        onClose={deleteDialogClose}
        actionButton={
          <Stack
            flexDirection="row"
            justifyContent="center"
            sx={{ gap: "16px", width: "100%" }}
          >
            <Button
              variant="contained"
              onClick={bankDelete}
              sx={{
                textTransform: "none",
                backgroundColor: "var(--delete-color)",
                borderRadius: "8px",
                width: "120px",
                height: "44px",
              }}
              disableElevation
            >
              {isLoading ? (
                <CircularProgress size={20} sx={{ color: "var(--white)" }} />
              ) : (
                "Delete"
              )}
            </Button>
            <Button
              variant="outlined"
              onClick={deleteDialogClose}
              sx={{
                textTransform: "none",
                borderRadius: "8px",
                color: "var(--text2)",
                borderColor: "var(--border-color)",
                width: "120px",
                height: "44px",
              }}
            >
              Cancel
            </Button>
          </Stack>
        }
      />
    </Stack>
  );
}
