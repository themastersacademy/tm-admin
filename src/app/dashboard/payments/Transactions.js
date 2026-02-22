"use client";
import { Box, Stack, Button, TextField, IconButton } from "@mui/material";
import { useEffect, useState, useCallback } from "react";
import { useSnackbar } from "notistack";
import TransactionDrawer from "./Components/TransactionDrawer";
import PageHeader from "./Components/PageHeader";
import TransactionsTable from "./Components/TransactionsTable";
import { printInvoice } from "./utils/printInvoice";
import SearchBox from "@/src/components/SearchBox/SearchBox";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function Transactions({ initialTransactions = [] }) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [skipInitialFetch, setSkipInitialFetch] = useState(
    initialTransactions.length > 0
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedUser(null);
  };

  const fetchTransactions = useCallback(
    async (signal) => {
      setLoading(true);
      try {
        let url = "/api/transactions/get-all";
        const params = new URLSearchParams();
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          params.append("startDate", start.getTime());
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          params.append("endDate", end.getTime());
        }

        if (params.toString()) url += `?${params.toString()}`;

        const abortSignal = signal instanceof AbortSignal ? signal : null;
        const res = await fetch(url, { signal: abortSignal });
        const data = await res.json();
        if (data.success) {
          const sortedTransactions = data.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setTransactions(sortedTransactions);
        } else {
          console.error("Failed to fetch transactions:", data.message);
          enqueueSnackbar(data.message, {
            variant: "error",
          });
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Error fetching transactions:", err);
        enqueueSnackbar("Error fetching transactions", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [startDate, endDate, enqueueSnackbar]
  );

  const handleRefund = async () => {
    if (!selectedUser || !selectedUser.paymentDetails?.razorpayPaymentId) {
      enqueueSnackbar("No valid payment ID found for this transaction", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }
    try {
      const response = await fetch("/api/transactions/refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId: selectedUser.paymentDetails.razorpayPaymentId,
          amount: selectedUser.amount,
          transactionId: selectedUser.id,
        }),
      });
      const result = await response.json();
      if (result.success) {
        enqueueSnackbar("Refund processed successfully", {
          variant: "success",
        });
        const updatedTransaction = result?.data?.transaction;
        if (updatedTransaction) {
          setSelectedUser(updatedTransaction);
          setTransactions((prev) =>
            prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))
          );
        } else {
          await fetchTransactions();
        }
      } else {
        enqueueSnackbar(`Refund failed: ${result.message}`, {
          variant: "error",
        });
      }
    } catch (err) {
      console.error("Refund error:", err);
      enqueueSnackbar(`Failed to process refund: ${err.message}`, {
        variant: "error",
      });
    }
  };

  const handleVerify = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const response = await fetch("/api/transactions/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId: selectedUser.id,
        }),
      });
      const result = await response.json();
      if (result.success) {
        enqueueSnackbar(result.message, {
          variant: "success",
        });
        if (result.data) {
          setSelectedUser(result.data);
          // Update the transaction in the list as well
          setTransactions((prev) =>
            prev.map((t) => (t.id === result.data.id ? result.data : t))
          );
        }
      } else {
        enqueueSnackbar(`Verification failed: ${result.message}`, {
          variant: "error",
        });
      }
    } catch (err) {
      console.error("Verification error:", err);
      enqueueSnackbar(`Failed to verify transaction: ${err.message}`, {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    printInvoice(selectedUser);
  };

  useEffect(() => {
    if (!startDate && !endDate && initialTransactions.length > 0) {
      setTransactions(initialTransactions);
      setSkipInitialFetch(true);
    }
  }, [initialTransactions, startDate, endDate]);

  useEffect(() => {
    if (skipInitialFetch && !startDate && !endDate) {
      setSkipInitialFetch(false);
      return;
    }

    const controller = new AbortController();
    fetchTransactions(controller.signal);
    return () => controller.abort();
  }, [fetchTransactions, skipInitialFetch, startDate, endDate]);

  return (
    <Stack gap="0px" padding="24px">
      <PageHeader
        title="Transactions"
        action={
          <>
            <Stack direction="row" gap={2}>
              <TextField
                id="start-date"
                type="date"
                size="small"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                sx={{ width: 150 }}
              />
              <TextField
                id="end-date"
                type="date"
                size="small"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                sx={{ width: 150 }}
              />
            </Stack>
            <SearchBox id="search-box" />
            <IconButton
              onClick={() => fetchTransactions()}
              disabled={loading}
              sx={{
                width: "40px",
                height: "40px",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                color: "var(--text2)",
                "&:hover": {
                  borderColor: "var(--primary-color)",
                  backgroundColor: "var(--bg-color)",
                  color: "var(--primary-color)",
                },
                "&.Mui-disabled": {
                  borderColor: "var(--border-color)",
                  color: "var(--text3)",
                },
              }}
            >
              <RefreshIcon
                sx={{
                  animation: loading ? "spin 1s linear infinite" : "none",
                  "@keyframes spin": {
                    "0%": {
                      transform: "rotate(0deg)",
                    },
                    "100%": {
                      transform: "rotate(360deg)",
                    },
                  },
                }}
              />
            </IconButton>
          </>
        }
      />
      <Stack gap="15px">
        <TransactionsTable
          transactions={transactions}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          onRowClick={handleRowClick}
        />
        <TransactionDrawer
          open={drawerOpen}
          onClose={handleDrawerClose}
          transaction={selectedUser}
          onPrint={handlePrint}
          onRefund={handleRefund}
          onVerify={handleVerify}
          loading={loading}
          enqueueSnackbar={enqueueSnackbar}
        />
      </Stack>
    </Stack>
  );
}
