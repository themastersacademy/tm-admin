"use client";
import { useState, useEffect, useCallback } from "react";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import { apiFetch } from "@/src/lib/apiFetch";
import {
  PlayCircleRounded,
  Close,
  InsertDriveFile,
  FolderOff,
  Sort,
  ArrowUpward,
  ArrowDownward,
  VideoLibrary,
  Description,
  Folder,
  ArrowBack,
  Search,
} from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Chip,
  Menu,
  MenuItem,
} from "@mui/material";
import { useSnackbar } from "@/src/app/context/SnackbarContext";

export default function LinkDialog({
  isOpen,
  onClose,
  handleLessonUpdate,
  course,
  lesson,
}) {
  const { showSnackbar } = useSnackbar();
  const [allBanks, setAllBanks] = useState([]);
  const [resourceList, setResourceList] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("asc");
  const [anchorEl, setAnchorEl] = useState(null);
  const [viewMode, setViewMode] = useState("BANKS");

  const handleSortClick = (event) => setAnchorEl(event.currentTarget);
  const handleSortClose = () => setAnchorEl(null);
  const handleSortSelect = (order) => {
    setSortOrder(order);
    handleSortClose();
  };

  const fetchBanks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/bank/get-all-bank`
      );
      setAllBanks(data.success ? data.data.banks : []);
    } catch (error) {
      console.error("Error fetching banks:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchBanks();
      setViewMode("BANKS");
      setSelectedBank(null);
      setSearchQuery("");
      setResourceList([]);
    }
  }, [isOpen, fetchBanks]);

  const fetchBankResources = useCallback(
    async (bank) => {
      setIsLoading(true);
      try {
        const data = await apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/bank/get-bank/${bank.bankID}`
        );
        if (data.success) {
          setResourceList(data.data.resources);
          setSelectedBank(bank);
          setViewMode("RESOURCES");
        } else {
          showSnackbar("No Bank Found", "error", "", "3000");
          setResourceList([]);
        }
      } catch (error) {
        console.error("Error fetching bank data:", error.message);
      } finally {
        setIsLoading(false);
      }
    },
    [showSnackbar]
  );

  const handleBackToBanks = () => {
    setViewMode("BANKS");
    setSelectedBank(null);
    setResourceList([]);
    setSearchQuery("");
    setFilterType("ALL");
  };

  const handleAddResource = useCallback(
    (resource) => {
      handleLessonUpdate(null, lesson.id, course.id, {
        resourceID: resource.resourceID,
      });
      onClose();
    },
    [handleLessonUpdate, lesson.id, course.id, onClose]
  );

  const filteredItems =
    viewMode === "BANKS"
      ? allBanks
          .filter((bank) => bank.title)
          .filter((bank) =>
            bank.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .sort((a, b) => a.title.localeCompare(b.title))
      : resourceList
          .filter((resource) => {
            const matchesSearch = (resource.name || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
            const matchesFilter =
              filterType === "ALL" || resource.type === filterType;
            return matchesSearch && matchesFilter;
          })
          .sort((a, b) => {
            const nameA = a.name || "";
            const nameB = b.name || "";
            return sortOrder === "asc"
              ? nameA.localeCompare(nameB)
              : nameB.localeCompare(nameA);
          });

  const FilterChip = ({ label, value, icon }) => {
    const active = filterType === value;
    return (
      <Chip
        icon={icon}
        label={label}
        size="small"
        onClick={() => setFilterType(value)}
        sx={{
          height: "24px",
          fontSize: "11px",
          fontWeight: 600,
          backgroundColor: active ? "var(--primary-color)" : "var(--white)",
          color: active ? "var(--white)" : "var(--text2)",
          border: "1px solid",
          borderColor: active ? "var(--primary-color)" : "var(--border-color)",
          "& .MuiChip-icon": {
            color: active ? "var(--white)" : "var(--text3)",
            fontSize: "14px",
          },
          "& .MuiChip-label": { padding: "0 6px" },
          "&:hover": {
            backgroundColor: active
              ? "var(--primary-color-dark)"
              : "rgba(0,0,0,0.04)",
          },
        }}
      />
    );
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          height: "75vh",
          maxHeight: "650px",
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <Stack direction="row" alignItems="center" gap="8px">
          {viewMode === "RESOURCES" && (
            <IconButton
              onClick={handleBackToBanks}
              size="small"
              sx={{
                width: 26,
                height: 26,
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
              }}
            >
              <ArrowBack sx={{ fontSize: "14px" }} />
            </IconButton>
          )}
          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "var(--text1)" }}>
            {viewMode === "BANKS"
              ? "Select Bank"
              : selectedBank?.title || "Resources"}
          </Typography>
          {viewMode === "RESOURCES" && (
            <Typography
              sx={{
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--text4)",
                backgroundColor: "var(--bg-color)",
                padding: "1px 6px",
                borderRadius: "4px",
                border: "1px solid var(--border-color)",
              }}
            >
              {filteredItems.length} items
            </Typography>
          )}
        </Stack>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ width: 26, height: 26 }}
        >
          <Close sx={{ fontSize: "16px" }} />
        </IconButton>
      </Stack>

      {/* Search + Filters */}
      <Stack
        gap="8px"
        sx={{
          padding: "10px 16px",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <TextField
          placeholder={
            viewMode === "BANKS" ? "Search banks..." : "Search resources..."
          }
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: "16px", color: "var(--text4)" }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: "8px",
              fontSize: "13px",
              height: "34px",
              backgroundColor: "var(--bg-color, #fafafa)",
              "& fieldset": { border: "none" },
            },
          }}
        />

        {viewMode === "RESOURCES" && (
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" gap="6px">
              <FilterChip label="All" value="ALL" />
              <FilterChip label="Videos" value="VIDEO" icon={<VideoLibrary />} />
              <FilterChip label="Files" value="FILE" icon={<Description />} />
            </Stack>
            <IconButton onClick={handleSortClick} size="small" sx={{ width: 26, height: 26 }}>
              <Sort sx={{ fontSize: "16px" }} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleSortClose}
              PaperProps={{ sx: { borderRadius: "8px", minWidth: "130px" } }}
            >
              <MenuItem
                onClick={() => handleSortSelect("asc")}
                sx={{ fontSize: "12px", gap: "6px" }}
              >
                <ArrowUpward sx={{ fontSize: "14px" }} /> A - Z
              </MenuItem>
              <MenuItem
                onClick={() => handleSortSelect("desc")}
                sx={{ fontSize: "12px", gap: "6px" }}
              >
                <ArrowDownward sx={{ fontSize: "14px" }} /> Z - A
              </MenuItem>
            </Menu>
          </Stack>
        )}
      </Stack>

      {/* Content */}
      <DialogContent sx={{ padding: "12px 16px" }}>
        {isLoading ? (
          <Stack alignItems="center" justifyContent="center" height="100%" minHeight="200px">
            <CircularProgress size={28} sx={{ color: "var(--primary-color)" }} />
          </Stack>
        ) : filteredItems.length > 0 ? (
          <Stack gap="6px">
            {viewMode === "BANKS"
              ? filteredItems.map((bank, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    alignItems="center"
                    gap="10px"
                    onClick={() => fetchBankResources(bank)}
                    sx={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        borderColor: "var(--primary-color)",
                        backgroundColor: "rgba(24, 113, 99, 0.03)",
                      },
                    }}
                  >
                    <Stack
                      justifyContent="center"
                      alignItems="center"
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "8px",
                        backgroundColor: "rgba(24, 113, 99, 0.06)",
                        color: "var(--primary-color)",
                        flexShrink: 0,
                      }}
                    >
                      <Folder sx={{ fontSize: "16px" }} />
                    </Stack>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--text1)",
                        flex: 1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={bank.title}
                    >
                      {bank.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "10px",
                        color: "var(--text4)",
                        flexShrink: 0,
                      }}
                    >
                      {bank.resourceCount || ""} {bank.resourceCount ? "resources" : ""}
                    </Typography>
                  </Stack>
                ))
              : filteredItems.map((item, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    alignItems="center"
                    gap="10px"
                    onClick={() => handleAddResource(item)}
                    sx={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        borderColor: "var(--primary-color)",
                        backgroundColor: "rgba(24, 113, 99, 0.03)",
                      },
                    }}
                  >
                    <Stack
                      justifyContent="center"
                      alignItems="center"
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "8px",
                        backgroundColor:
                          item.type === "VIDEO"
                            ? "rgba(24, 113, 99, 0.06)"
                            : "rgba(255, 152, 0, 0.06)",
                        color:
                          item.type === "VIDEO"
                            ? "var(--primary-color)"
                            : "#FF9800",
                        flexShrink: 0,
                      }}
                    >
                      {item.type === "VIDEO" ? (
                        <PlayCircleRounded sx={{ fontSize: "16px" }} />
                      ) : (
                        <InsertDriveFile sx={{ fontSize: "16px" }} />
                      )}
                    </Stack>
                    <Stack flex={1} overflow="hidden">
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "var(--text1)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={item.name}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "10px",
                          color: "var(--text4)",
                          textTransform: "uppercase",
                          fontWeight: 600,
                        }}
                      >
                        {item.type}
                      </Typography>
                    </Stack>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        textTransform: "none",
                        fontSize: "10px",
                        fontWeight: 600,
                        borderRadius: "6px",
                        padding: "2px 10px",
                        height: "24px",
                        minWidth: "unset",
                        borderColor: "var(--primary-color)",
                        color: "var(--primary-color)",
                        flexShrink: 0,
                        "&:hover": {
                          backgroundColor: "rgba(24, 113, 99, 0.04)",
                          borderColor: "var(--primary-color)",
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddResource(item);
                      }}
                    >
                      Link
                    </Button>
                  </Stack>
                ))}
          </Stack>
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            height="100%"
            gap="8px"
            sx={{ opacity: 0.6 }}
          >
            <FolderOff sx={{ fontSize: "40px", color: "var(--text4)" }} />
            <Typography sx={{ fontSize: "13px", color: "var(--text3)", fontWeight: 600 }}>
              {viewMode === "BANKS"
                ? "No banks found"
                : "No resources found"}
            </Typography>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
