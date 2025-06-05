"use client";
import SearchBox from "@/src/components/SearchBox/SearchBox";
import { LocalMall } from "@mui/icons-material";
import {
  Box,
  Chip,
  Divider,
  Drawer,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedUser(null);
  };

  const fetchTransactions = async () => {
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
  };

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

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <Stack
      sx={{
        padding: "20px",
        border: "1px solid var(--border-color)",
        minHeight: "100vh",
        backgroundColor: "var(--white)",
        borderRadius: "10px",
        gap: "20px",
        marginTop: "20px",
        maxWidth: "1200px",
      }}
    >
      <Stack flexDirection="row" justifyContent="space-between">
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "20px",
            fontWeight: "700",
            color: "var(--text3)",
          }}
        >
          Transactions
        </Typography>
        <Stack flexDirection="row" gap="10px" alignItems="flex-end">
          <SearchBox />
        </Stack>
      </Stack>
      <Stack gap="15px">
        <TableContainer
          sx={{
            boxShadow: "none",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
          }}
          component={Paper}
        >
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead sx={{ backgroundColor: "var(--library-expand)" }}>
              <TableRow>
                <TableCell align="left">Name</TableCell>
                <TableCell align="left">Order ID</TableCell>
                <TableCell align="left">Amount</TableCell>
                <TableCell align="left">Date</TableCell>
                <TableCell align="left">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction, index) => (
                <TableRow
                  key={index}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "var(--library-expand)" },
                  }}
                  onClick={() => handleRowClick(transaction)}
                >
                  <TableCell component="th" scope="row">
                    <Stack flexDirection="row" gap="10px" alignItems="center">
                      <LocalMall
                        sx={{
                          color:
                            transaction.status === "completed"
                              ? "var(--primary-color)"
                              : transaction.status === "pending"
                              ? "var(--sec-color)"
                              : transaction.status === "cancelled"
                              ? "var(--text4)"
                              : transaction.status === "refunded"
                              ? "var(--delete-color)"
                              : "var(--delete-color)",
                          fontSize: "24px",
                        }}
                      />
                      {transaction.userMeta.name}
                    </Stack>
                  </TableCell>
                  <TableCell align="left">{transaction.order.id}</TableCell>
                  <TableCell align="left">₹{transaction.amount}</TableCell>
                  <TableCell align="left">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="left">
                    <Chip
                      label={transaction.status || ""}
                      size="small"
                      sx={{
                        backgroundColor:
                          transaction.status === "completed"
                            ? "var(--primary-color)"
                            : transaction.status === "pending"
                            ? "var(--sec-color)"
                            : transaction.status === "cancelled"
                            ? "var(--text4)"
                            : transaction.status === "refunded"
                            ? "var(--delete-color)"
                            : "var(--delete-color)",
                        fontSize: "14px",
                        color:
                          transaction.status === "completed"
                            ? "white"
                            : transaction.status === "pending"
                            ? "white"
                            : transaction.status === "cancelled"
                            ? "white"
                            : transaction.status === "refunded"
                            ? "white"
                            : "white",
                        borderRadius: "6px",
                        textTransform: "capitalize",
                        minWidth: "90px",
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={handleDrawerClose}
          sx={{ zIndex: 1300, minHeight: "100vh" }}
        >
          <Box
            sx={{
              padding: 2,
              minHeight: "100%",
              display: "flex",
              width: "350px",
            }}
          >
            {selectedUser ? (
              <Stack gap={1} width="100%" height="100%">
                <Stack direction="row" gap="5px" alignItems="center">
                  <LocalMall
                    sx={{ color: "var(--primary-color)", fontSize: "24px" }}
                  />
                  <Typography sx={{ fontFamily: "Lato", fontSize: "22px" }}>
                    {selectedUser.userMeta.name}
                  </Typography>
                  <Chip
                    label={selectedUser.status || ""}
                    size="small"
                    sx={{
                      backgroundColor:
                        selectedUser.status === "completed"
                          ? "var(--primary-color)"
                          : selectedUser.status === "pending"
                          ? "var(--sec-color)"
                          : selectedUser.status === "cancelled"
                          ? "var(--text4)"
                          : selectedUser.status === "refunded"
                          ? "var(--delete-color)"
                          : "var(--delete-color)",
                      fontSize: "14px",
                      color:
                        selectedUser.status === "completed"
                          ? "white"
                          : selectedUser.status === "pending"
                          ? "white"
                          : selectedUser.status === "cancelled"
                          ? "white"
                          : selectedUser.status === "refunded"
                          ? "white"
                          : "white",
                      borderRadius: "6px",
                      marginLeft: "auto",
                      textTransform: "capitalize",
                    }}
                  />
                </Stack>
                <Divider sx={{ my: 1 }} />
                <Stack gap="10px">
                  <Stack
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography
                      sx={{
                        fontFamily: "Lato",
                        fontSize: "16px",
                      }}
                    >
                      Order ID
                    </Typography>
                    <Typography sx={{ color: "var(--text3)" }}>
                      {selectedUser.order.id}
                    </Typography>
                  </Stack>
                  <Stack
                    flexDirection="row"
                    gap="10px"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography
                      sx={{
                        fontFamily: "Lato",
                        fontSize: "16px",
                      }}
                    >
                      Email ID
                    </Typography>
                    <Typography sx={{ color: "var(--text3)" }}>
                      {selectedUser.userMeta.email}
                    </Typography>
                  </Stack>
                  <Stack
                    flexDirection="row"
                    gap="10px"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography
                      sx={{
                        fontFamily: "Lato",
                        fontSize: "16px",
                      }}
                    >
                      Purchase Date
                    </Typography>
                    <Typography sx={{ color: "var(--text3)" }}>
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </Typography>
                  </Stack>

                  <Stack gap="10px">
                    <Typography
                      sx={{
                        fontFamily: "Lato",
                        fontSize: "18px",
                        fontWeight: "700",
                        marginTop: "10px",
                      }}
                    >
                      User Details
                    </Typography>
                    <Divider />
                    <Stack
                      flexDirection="row"
                      gap="10px"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography
                        sx={{
                          fontFamily: "Lato",
                          fontSize: "16px",
                        }}
                      >
                        Phone Number
                      </Typography>
                      <Typography sx={{ color: "var(--text3)" }}>
                        {selectedUser.userMeta.billingInfo.phone}
                      </Typography>
                    </Stack>
                    <Stack
                      flexDirection="row"
                      gap="10px"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography
                        sx={{
                          fontFamily: "Lato",
                          fontSize: "16px",
                        }}
                      >
                        City
                      </Typography>
                      <Typography sx={{ color: "var(--text3)" }}>
                        {selectedUser.userMeta.billingInfo.city}
                      </Typography>
                    </Stack>
                    <Stack
                      flexDirection="row"
                      gap="10px"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography
                        sx={{
                          fontFamily: "Lato",
                          fontSize: "16px",
                        }}
                      >
                        State
                      </Typography>
                      <Typography sx={{ color: "var(--text3)" }}>
                        {selectedUser.userMeta.billingInfo.state}
                      </Typography>
                    </Stack>
                  </Stack>
                  {selectedUser?.status === "completed" && (
                    <Stack gap="10px">
                      <Typography
                        sx={{
                          fontFamily: "Lato",
                          fontSize: "18px",
                          fontWeight: "700",
                          marginTop: "10px",
                        }}
                      >
                        Billing Details
                      </Typography>
                      <Divider />
                      <Stack
                        flexDirection="row"
                        gap="10px"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography
                          sx={{
                            fontFamily: "Lato",
                            fontSize: "16px",
                          }}
                        >
                          Payment Method
                        </Typography>
                        <Typography sx={{ color: "var(--text3)" }}>
                          {selectedUser?.paymentDetails?.method}
                        </Typography>
                      </Stack>
                      <Stack
                        flexDirection="row"
                        gap="10px"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography
                          sx={{
                            fontFamily: "Lato",
                            fontSize: "16px",
                          }}
                        >
                          Payment ID
                        </Typography>
                        <Typography sx={{ color: "var(--text3)" }}>
                          {selectedUser?.paymentDetails?.razorpayPaymentId}
                        </Typography>
                      </Stack>
                    </Stack>
                  )}
                  {selectedUser?.status === "refunded" && (
                    <Stack gap="10px">
                      <Typography
                        sx={{
                          fontFamily: "Lato",
                          fontSize: "18px",
                          fontWeight: "700",
                          marginTop: "10px",
                        }}
                      >
                        Refund Details
                      </Typography>
                      <Divider />
                      <Stack
                        flexDirection="row"
                        gap="10px"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography
                          sx={{
                            fontFamily: "Lato",
                            fontSize: "16px",
                          }}
                        >
                          Refunded Amount
                        </Typography>
                        <Typography sx={{ color: "var(--text3)" }}>
                          ₹{selectedUser?.paymentDetails?.refundedAmount}
                        </Typography>
                      </Stack>
                      <Stack
                        flexDirection="row"
                        gap="10px"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography
                          sx={{
                            fontFamily: "Lato",
                            fontSize: "16px",
                          }}
                        >
                          Refunded At
                        </Typography>
                        <Typography sx={{ color: "var(--text3)" }}>
                          {new Date(
                            selectedUser?.paymentDetails?.refundedAt
                          ).toLocaleDateString()}
                        </Typography>
                      </Stack>
                      <Stack
                        flexDirection="row"
                        gap="10px"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography
                          sx={{
                            fontFamily: "Lato",
                            fontSize: "16px",
                          }}
                        >
                          Refund ID
                        </Typography>
                        <Typography sx={{ color: "var(--text3)" }}>
                          {selectedUser?.paymentDetails?.refundId}
                        </Typography>
                      </Stack>
                      <Stack
                        flexDirection="row"
                        gap="10px"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography
                          sx={{
                            fontFamily: "Lato",
                            fontSize: "16px",
                          }}
                        >
                          Refunded Status
                        </Typography>
                        <Typography sx={{ color: "var(--text3)" }}>
                          {selectedUser?.paymentDetails?.status}
                        </Typography>
                      </Stack>
                    </Stack>
                  )}
                  {/* {selectedUser?.status === "completed" && (
                    <Stack
                      flexDirection="row"
                      gap="10px"
                      marginTop="10px"
                      justifyContent="space-between"
                    >
                      {selectedUser?.status === "completed" && (
                        <IconButton
                          onClick={refreshTransaction}
                        sx={{
                          backgroundColor: "var(--primary-color)",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "var(--primary-color)",
                          },
                        }}
                      >
                        <RefreshIcon />
                      </IconButton>
                      )}
                      {loading ? (
                        <CircularProgress />
                      ) : (
                        <Button
                          variant="contained"
                          color="error"
                          sx={{
                            textTransform: "none",
                            fontFamily: "Lato",
                            fontSize: "16px",
                            borderRadius: "6px",
                          }}
                          onClick={handleRefund}
                        >
                          Refund
                        </Button>
                      )}
                    </Stack>
                  )} */}
                </Stack>

                <Stack sx={{ marginTop: "auto" }}>
                  <Divider sx={{ my: 1 }} />
                  <Stack
                    flexDirection="row"
                    gap="10px"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ marginTop: "auto" }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Lato",
                        fontSize: "20px",
                        fontWeight: "700",
                      }}
                    >
                      Total
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Lato",
                        fontSize: "20px",
                        fontWeight: "700",
                      }}
                    >
                      ₹{selectedUser.amount}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            ) : (
              <Typography variant="body2">No user selected</Typography>
            )}
          </Box>
        </Drawer>
      </Stack>
    </Stack>
  );
}
