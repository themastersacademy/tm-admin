"use client";
import { useState, useEffect, useCallback } from "react";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SearchBox from "@/src/components/SearchBox/SearchBox";
import { apiFetch } from "@/src/lib/apiFetch";
import {
  PlayCircleRounded,
  Close,
  InsertDriveFile,
  FolderOff,
  FilterList,
  Sort,
  ArrowUpward,
  ArrowDownward,
  VideoLibrary,
  Description,
  GridView,
  Folder,
  ArrowBack,
  ChevronRight,
} from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  Chip,
  Menu,
  MenuItem,
  Divider,
  Breadcrumbs,
  Link,
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
  const [selectedBank, setSelectedBank] = useState(null); // Object or null
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState("ALL"); // ALL, VIDEO, FILE
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
  const [anchorEl, setAnchorEl] = useState(null);
  const [viewMode, setViewMode] = useState("BANKS"); // BANKS, RESOURCES

  const handleSortClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setAnchorEl(null);
  };

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

  const handleBankClick = (bank) => {
    fetchBankResources(bank);
  };

  const handleBackToBanks = () => {
    setViewMode("BANKS");
    setSelectedBank(null);
    setResourceList([]);
    setSearchQuery("");
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
          .filter((bank) =>
            bank.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .sort((a, b) => a.title.localeCompare(b.title))
      : resourceList
          .filter((resource) => {
            const matchesSearch = resource.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
            const matchesFilter =
              filterType === "ALL" || resource.type === filterType;
            return matchesSearch && matchesFilter;
          })
          .sort((a, b) => {
            if (sortOrder === "asc") {
              return a.name.localeCompare(b.name);
            } else {
              return b.name.localeCompare(a.name);
            }
          });

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          height: "85vh",
          maxHeight: "800px",
          backgroundColor: "#F8F9FA",
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          padding: "20px 24px",
          backgroundColor: "var(--white)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <Stack direction="row" alignItems="center" gap="16px">
          {viewMode === "RESOURCES" && (
            <IconButton onClick={handleBackToBanks} size="small">
              <ArrowBack />
            </IconButton>
          )}
          <Stack>
            <Breadcrumbs
              separator={<ChevronRight fontSize="small" />}
              aria-label="breadcrumb"
            >
              <Link
                underline="hover"
                color={viewMode === "BANKS" ? "text.primary" : "inherit"}
                onClick={
                  viewMode === "RESOURCES" ? handleBackToBanks : undefined
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: viewMode === "RESOURCES" ? "pointer" : "default",
                  fontWeight: viewMode === "BANKS" ? 700 : 500,
                  fontSize: "16px",
                  fontFamily: "Lato",
                }}
              >
                <Folder sx={{ mr: 0.5 }} fontSize="inherit" />
                My Banks
              </Link>
              {selectedBank && (
                <Typography
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 700,
                    fontSize: "16px",
                    fontFamily: "Lato",
                    color: "var(--text1)",
                  }}
                >
                  {selectedBank.title}
                </Typography>
              )}
            </Breadcrumbs>
          </Stack>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Stack>

      <DialogContent sx={{ padding: "24px" }}>
        <Stack gap="24px" height="100%">
          {/* Controls */}
          <Stack gap="16px">
            <Stack direction="row" gap="16px" alignItems="center">
              <Stack flex={1}>
                <SearchBox
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    viewMode === "BANKS"
                      ? "Search banks..."
                      : "Search resources..."
                  }
                />
              </Stack>
            </Stack>

            {viewMode === "RESOURCES" && (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack direction="row" gap="8px">
                  <Chip
                    label="All"
                    onClick={() => setFilterType("ALL")}
                    sx={{
                      backgroundColor:
                        filterType === "ALL"
                          ? "var(--primary-color)"
                          : "var(--white)",
                      color:
                        filterType === "ALL" ? "var(--white)" : "var(--text2)",
                      fontWeight: 600,
                      border: "1px solid",
                      borderColor:
                        filterType === "ALL"
                          ? "var(--primary-color)"
                          : "var(--border-color)",
                      "&:hover": {
                        backgroundColor:
                          filterType === "ALL"
                            ? "var(--primary-color-dark)"
                            : "rgba(0,0,0,0.05)",
                      },
                    }}
                  />
                  <Chip
                    icon={<VideoLibrary fontSize="small" />}
                    label="Videos"
                    onClick={() => setFilterType("VIDEO")}
                    sx={{
                      backgroundColor:
                        filterType === "VIDEO"
                          ? "var(--primary-color)"
                          : "var(--white)",
                      color:
                        filterType === "VIDEO"
                          ? "var(--white)"
                          : "var(--text2)",
                      fontWeight: 600,
                      border: "1px solid",
                      borderColor:
                        filterType === "VIDEO"
                          ? "var(--primary-color)"
                          : "var(--border-color)",
                      "& .MuiChip-icon": {
                        color:
                          filterType === "VIDEO"
                            ? "var(--white)"
                            : "var(--text2)",
                      },
                      "&:hover": {
                        backgroundColor:
                          filterType === "VIDEO"
                            ? "var(--primary-color-dark)"
                            : "rgba(0,0,0,0.05)",
                      },
                    }}
                  />
                  <Chip
                    icon={<Description fontSize="small" />}
                    label="Files"
                    onClick={() => setFilterType("FILE")}
                    sx={{
                      backgroundColor:
                        filterType === "FILE"
                          ? "var(--primary-color)"
                          : "var(--white)",
                      color:
                        filterType === "FILE" ? "var(--white)" : "var(--text2)",
                      fontWeight: 600,
                      border: "1px solid",
                      borderColor:
                        filterType === "FILE"
                          ? "var(--primary-color)"
                          : "var(--border-color)",
                      "& .MuiChip-icon": {
                        color:
                          filterType === "FILE"
                            ? "var(--white)"
                            : "var(--text2)",
                      },
                      "&:hover": {
                        backgroundColor:
                          filterType === "FILE"
                            ? "var(--primary-color-dark)"
                            : "rgba(0,0,0,0.05)",
                      },
                    }}
                  />
                </Stack>

                <Stack direction="row" alignItems="center" gap="8px">
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--text3)",
                    }}
                  >
                    {filteredItems.length} items
                  </Typography>
                  <IconButton onClick={handleSortClick} size="small">
                    <Sort fontSize="small" />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleSortClose}
                  >
                    <MenuItem onClick={() => handleSortSelect("asc")}>
                      <ArrowUpward fontSize="small" sx={{ mr: 1 }} /> Name (A-Z)
                    </MenuItem>
                    <MenuItem onClick={() => handleSortSelect("desc")}>
                      <ArrowDownward fontSize="small" sx={{ mr: 1 }} /> Name
                      (Z-A)
                    </MenuItem>
                  </Menu>
                </Stack>
              </Stack>
            )}
          </Stack>

          <Divider />

          {/* Content Grid */}
          <Stack flex={1} sx={{ overflowY: "auto", paddingBottom: "10px" }}>
            {isLoading ? (
              <Stack
                alignItems="center"
                justifyContent="center"
                height="100%"
                minHeight="200px"
              >
                <CircularProgress
                  size={40}
                  sx={{ color: "var(--primary-color)" }}
                />
              </Stack>
            ) : filteredItems.length > 0 ? (
              <Stack
                direction="row"
                flexWrap="wrap"
                gap="16px"
                alignContent="flex-start"
              >
                {viewMode === "BANKS"
                  ? filteredItems.map((bank, index) => (
                      <Stack
                        key={index}
                        onClick={() => handleBankClick(bank)}
                        sx={{
                          width: "calc(33.333% - 11px)",
                          backgroundColor: "var(--white)",
                          borderRadius: "12px",
                          border: "1px solid var(--border-color)",
                          padding: "16px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: "var(--primary-color)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" gap="16px">
                          <Stack
                            justifyContent="center"
                            alignItems="center"
                            sx={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "10px",
                              backgroundColor: "rgba(var(--primary-rgb), 0.08)",
                              color: "var(--primary-color)",
                            }}
                          >
                            <Folder fontSize="large" />
                          </Stack>
                          <Stack gap="4px" overflow="hidden">
                            <Typography
                              sx={{
                                fontFamily: "Lato",
                                fontSize: "16px",
                                fontWeight: 700,
                                color: "var(--text1)",
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
                                fontFamily: "Lato",
                                fontSize: "12px",
                                color: "var(--text3)",
                                fontWeight: 600,
                              }}
                            >
                              Bank Folder
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>
                    ))
                  : filteredItems.map((item, index) => (
                      <Stack
                        key={index}
                        onClick={() => handleAddResource(item)}
                        sx={{
                          width: "calc(33.333% - 11px)",
                          backgroundColor: "var(--white)",
                          borderRadius: "12px",
                          border: "1px solid var(--border-color)",
                          padding: "16px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          position: "relative",
                          overflow: "hidden",
                          "&:hover": {
                            borderColor: "var(--primary-color)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            transform: "translateY(-2px)",
                            "& .link-btn": {
                              opacity: 1,
                              transform: "translateY(0)",
                            },
                          },
                        }}
                      >
                        <Stack
                          gap="12px"
                          alignItems="center"
                          textAlign="center"
                        >
                          <Stack
                            justifyContent="center"
                            alignItems="center"
                            sx={{
                              width: "64px",
                              height: "64px",
                              borderRadius: "12px",
                              backgroundColor:
                                item.type === "VIDEO"
                                  ? "rgba(var(--primary-rgb), 0.08)"
                                  : "rgba(var(--secondary-rgb), 0.08)",
                              color:
                                item.type === "VIDEO"
                                  ? "var(--primary-color)"
                                  : "var(--secondary-color)",
                              marginBottom: "4px",
                            }}
                          >
                            {item.type === "VIDEO" ? (
                              <PlayCircleRounded sx={{ fontSize: "32px" }} />
                            ) : (
                              <InsertDriveFile sx={{ fontSize: "32px" }} />
                            )}
                          </Stack>

                          <Stack gap="4px" width="100%">
                            <Typography
                              sx={{
                                fontFamily: "Lato",
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "var(--text1)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={item.name}
                            >
                              {item.name}
                            </Typography>

                            {/* Enhanced Info */}
                            <Stack
                              direction="row"
                              justifyContent="center"
                              alignItems="center"
                              gap="8px"
                              sx={{ opacity: 0.7 }}
                            >
                              <Typography
                                sx={{
                                  fontFamily: "Lato",
                                  fontSize: "11px",
                                  color: "var(--text3)",
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                }}
                              >
                                {item.type}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Stack>

                        {/* Hover Overlay Button */}
                        <Stack
                          className="link-btn"
                          alignItems="center"
                          justifyContent="center"
                          sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: "12px",
                            background:
                              "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 100%)",
                            opacity: 0,
                            transform: "translateY(100%)",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            sx={{
                              backgroundColor: "var(--primary-color)",
                              textTransform: "none",
                              borderRadius: "6px",
                              fontWeight: 600,
                              boxShadow: "none",
                              "&:hover": {
                                backgroundColor: "var(--primary-color-dark)",
                                boxShadow: "none",
                              },
                            }}
                          >
                            Link Resource
                          </Button>
                        </Stack>
                      </Stack>
                    ))}
              </Stack>
            ) : (
              <Stack
                alignItems="center"
                justifyContent="center"
                height="100%"
                gap="16px"
                sx={{ opacity: 0.7 }}
              >
                <FolderOff sx={{ fontSize: "64px", color: "var(--text3)" }} />
                <Typography
                  sx={{
                    fontFamily: "Lato",
                    fontSize: "16px",
                    color: "var(--text2)",
                    fontWeight: 600,
                  }}
                >
                  {viewMode === "BANKS"
                    ? "No banks found"
                    : "No resources found in this bank"}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
