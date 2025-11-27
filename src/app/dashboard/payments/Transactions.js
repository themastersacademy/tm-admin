"use client";
import { Box, Stack, Button } from "@mui/material";
import { useEffect, useState, useCallback } from "react";
import { useSnackbar } from "notistack";
import TransactionDrawer from "./Components/TransactionDrawer";
import PageHeader from "./Components/PageHeader";
import TransactionsTable from "./Components/TransactionsTable";
import { printInvoice } from "./utils/printInvoice";
import SearchBox from "@/src/components/SearchBox/SearchBox";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions/get-all");
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data);
      } else {
        console.error("Failed to fetch transactions:", data.message);
        enqueueSnackbar(data.message, {
          variant: "error",
        });
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      enqueueSnackbar("Error fetching transactions", {
        variant: "error",
      });
    }
  }, [enqueueSnackbar]);

  const refreshTransaction = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch("/api/transactions/get-all");
      const data = await res.json();
      if (data.success) {
        const updatedTransaction = data.data.find(
          (t) => t.id === selectedUser.id
        );
        if (updatedTransaction) {
          setSelectedUser(updatedTransaction);
        } else {
          enqueueSnackbar("Transaction not found", {
            variant: "error",
          });
          handleDrawerClose();
        }
      } else {
        enqueueSnackbar("Failed to refresh transaction: " + data.message, {
          variant: "error",
        });
      }
    } catch (err) {
      console.error("Error refreshing transaction:", err);
      enqueueSnackbar("Failed to refresh transaction", {
        variant: "error",
      });
    }
  };

  const handleRefund = async () => {
    if (!selectedUser || !selectedUser.paymentDetails?.razorpayPaymentId) {
      enqueueSnackbar("No valid payment ID found for this transaction", {
        variant: "error",
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
        }),
      });
      const result = await response.json();
      if (result.success) {
        enqueueSnackbar("Refund processed successfully", {
          variant: "success",
        });
        await fetchTransactions();
        await refreshTransaction();
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

  const handlePrint = () => {
    printInvoice(selectedUser);
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <Stack gap="0px" padding="24px">
      <PageHeader
        title="Transactions"
        action={
          <>
            <SearchBox />
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchTransactions}
              sx={{
                height: "40px",
                textTransform: "none",
                borderColor: "var(--border-color)",
                color: "var(--text2)",
                "&:hover": {
                  borderColor: "var(--primary-color)",
                  backgroundColor: "var(--bg-color)",
                },
              }}
            >
              Refresh
            </Button>
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
          loading={loading}
          enqueueSnackbar={enqueueSnackbar}
        />
      </Stack>
    </Stack>
  );
}
