"use client";
import SearchBox from "@/src/components/SearchBox/SearchBox";
import {
  LocalMall,
  Print,
  Close,
  Person,
  Email,
  Phone,
  LocationOn,
  CreditCard,
  Receipt,
  ContentCopy,
  CheckCircle,
  Cancel,
  Error as ErrorIcon,
  Help,
} from "@mui/icons-material";
import {
  Avatar,
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
  TablePagination,
  Tooltip,
  Grid,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import RefreshIcon from "@mui/icons-material/Refresh";

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return { bg: "#E8F5E9", color: "#2E7D32" };
    case "pending":
      return { bg: "#FFF3E0", color: "#EF6C00" };
    case "cancelled":
      return { bg: "#FFEBEE", color: "#C62828" };
    case "refunded":
      return { bg: "#F3E5F5", color: "#7B1FA2" };
    default:
      return { bg: "#E3F2FD", color: "#1565C0" };
  }
};

const headerCellStyle = {
  backgroundColor: "var(--bg-color)",
  color: "var(--text3)",
  fontWeight: 700,
  fontSize: "13px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  borderBottom: "2px solid var(--border-color)",
  padding: "16px",
};

const cellStyle = {
  borderBottom: "1px solid var(--border-color)",
  padding: "16px",
};

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

  const handlePrint = () => {
    if (!selectedUser) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const totalAmount = selectedUser.amount || 0;
    const baseAmount = (totalAmount / 1.18).toFixed(2);
    const taxAmount = (totalAmount - baseAmount).toFixed(2);

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Tax Invoice - ${
            selectedUser.order?.id || selectedUser.orderId || "N/A"
          }</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; max-width: 900px; margin: 0 auto; background: #fff; line-height: 1.6; }
            .invoice-container { border: 1px solid #ddd; padding: 40px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #2E7D32; }
            .company-info { flex: 1; }
            .logo-section { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
            .logo-icon { width: 50px; height: 50px; background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 800; }
            .company-name { font-size: 28px; font-weight: 800; color: #2E7D32; letter-spacing: -0.5px; }
            .company-address { font-size: 13px; color: #666; line-height: 1.8; margin-top: 8px; }
            .invoice-meta { text-align: right; }
            .invoice-title { font-size: 32px; font-weight: 800; color: #2E7D32; margin-bottom: 8px; }
            .invoice-number { font-size: 16px; color: #666; margin-bottom: 4px; }
            .invoice-date { font-size: 14px; color: #888; }
            .status-badge { background: #E8F5E9; color: #2E7D32; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 12px; display: inline-block; margin-top: 8px; }
            .parties-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; padding: 24px; background: #f9f9f9; border-radius: 8px; }
            .party-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin-bottom: 12px; font-weight: 700; }
            .party-name { font-size: 18px; font-weight: 700; color: #111; margin-bottom: 6px; }
            .party-details { font-size: 14px; color: #666; line-height: 1.8; }
            .table-container { margin-bottom: 30px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
            table { width: 100%; border-collapse: collapse; }
            thead { background: #f5f5f5; }
            th { text-align: left; padding: 16px; color: #555; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
            th.text-right { text-align: right; }
            td { padding: 16px; border-top: 1px solid #eee; font-size: 14px; vertical-align: top; }
            td.text-right { text-align: right; }
            .item-description { font-weight: 600; margin-bottom: 4px; color: #111; }
            .item-meta { font-size: 12px; color: #888; }
            .totals-section { display: flex; justify-content: flex-end; margin-top: 30px; }
            .totals-box { min-width: 350px; }
            .total-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
            .total-row:last-child { border-bottom: none; }
            .total-row.grand-total { background: #f9f9f9; padding: 16px 20px; margin-top: 12px; border-radius: 8px; border: 2px solid #2E7D32; }
            .total-row.grand-total .label { font-weight: 800; font-size: 16px; color: #111; }
            .total-row.grand-total .amount { font-size: 26px; font-weight: 800; color: #2E7D32; }
            .payment-info { margin: 30px 0; padding: 20px; background: #f0f7f0; border-left: 4px solid #2E7D32; border-radius: 4px; }
            .payment-title { font-weight: 700; color: #2E7D32; margin-bottom: 8px; font-size: 14px; }
            .payment-details { font-size: 13px; color: #555; }
            .notes-section { margin: 30px 0; padding: 20px; background: #fafafa; border-radius: 8px; }
            .notes-title { font-weight: 700; margin-bottom: 8px; font-size: 14px; color: #555; }
            .notes-text { font-size: 13px; color: #666; line-height: 1.8; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #f0f0f0; text-align: center; }
            .footer-text { font-size: 12px; color: #999; margin-bottom: 6px; }
            .footer-brand { font-size: 13px; color: #2E7D32; font-weight: 600; }
            @media print { body { padding: 20px; } .invoice-container { border: none; padding: 0; } }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="company-info">
                <div class="logo-section">
                  <div class="logo-icon">L</div>
                  <div class="company-name">LMS Admin</div>
                </div>
                <div class="company-address">
                  123 Education Street, Learning Hub<br>
                  Bangalore, Karnataka - 560001<br>
                  GSTIN: 29XXXXX1234X1ZX<br>
                  Email: billing@lmsadmin.com<br>
                  Phone: +91 98765 43210
                </div>
              </div>
              <div class="invoice-meta">
                <div class="invoice-title">TAX INVOICE</div>
                <div class="invoice-number">Invoice #${
                  selectedUser.order?.id ||
                  selectedUser.orderId ||
                  "INV-" + Date.now()
                }</div>
                <div class="invoice-date">Date: ${
                  selectedUser.createdAt
                    ? new Date(selectedUser.createdAt).toLocaleDateString(
                        "en-IN",
                        { day: "2-digit", month: "short", year: "numeric" }
                      )
                    : new Date().toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                }</div>
                <div class="status-badge">${
                  selectedUser.status?.toUpperCase() || "PAID"
                }</div>
              </div>
            </div>
            <div class="parties-section">
              <div class="party-box">
                <div class="party-label">Bill To</div>
                <div class="party-name">${
                  selectedUser.userMeta?.name || "Customer"
                }</div>
                <div class="party-details">${
                  selectedUser.userMeta?.email || "N/A"
                }<br>${selectedUser.userMeta?.phone || ""}</div>
              </div>
              <div class="party-box">
                <div class="party-label">Payment Information</div>
                <div class="party-details"><strong>Payment Method:</strong> ${
                  selectedUser.paymentDetails?.method || "Online Payment"
                }<br><strong>Transaction ID:</strong> ${
      selectedUser.id || "N/A"
    }<br><strong>Status:</strong> <span style="color: #2E7D32; font-weight: 600;">${
      selectedUser.status || "Completed"
    }</span></div>
              </div>
            </div>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th style="width: 50%;">Description</th>
                    <th style="width: 15%;" class="text-right">Qty</th>
                    <th style="width: 20%;" class="text-right">Rate (₹)</th>
                    <th style="width: 15%;" class="text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div class="item-description">Course / Subscription Purchase</div>
                      <div class="item-meta">Digital Learning Content<br>HSN/SAC: 999293</div>
                    </td>
                    <td class="text-right">1</td>
                    <td class="text-right">${baseAmount}</td>
                    <td class="text-right" style="font-weight: 600;">${baseAmount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="totals-section">
              <div class="totals-box">
                <div class="total-row subtotal">
                  <span class="label">Subtotal</span>
                  <span class="amount">₹${baseAmount}</span>
                </div>
                <div class="total-row tax">
                  <span class="label">CGST @ 9%</span>
                  <span class="amount">₹${(taxAmount / 2).toFixed(2)}</span>
                </div>
                <div class="total-row tax">
                  <span class="label">SGST @ 9%</span>
                  <span class="amount">₹${(taxAmount / 2).toFixed(2)}</span>
                </div>
                <div class="total-row grand-total">
                  <span class="label">Total Amount</span>
                  <span class="amount">₹${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div class="payment-info">
              <div class="payment-title">✓ Payment Received</div>
              <div class="payment-details">Amount of ₹${totalAmount.toFixed(
                2
              )} has been successfully received and processed.<br>This is a computer-generated invoice and does not require a physical signature.</div>
            </div>
            <div class="notes-section">
              <div class="notes-title">Terms & Conditions</div>
              <div class="notes-text">• All sales are final and non-refundable unless stated otherwise in our refund policy.<br>• Access to digital content will be provided within 24 hours of payment confirmation.<br>• For any queries or support, please contact us at support@lmsadmin.com.<br>• This invoice is subject to realization of payment.</div>
            </div>
            <div class="footer">
              <div class="footer-text">Thank you for your business!</div>
              <div class="footer-brand">LMS Admin - Empowering Education</div>
              <div class="footer-text" style="margin-top: 8px;">This is a computer-generated document. No signature required.</div>
            </div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <Stack gap="20px" padding="20px" pt="30px">
      <Stack flexDirection="row" justifyContent="space-between">
        <Typography
          sx={{
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--text1)",
          }}
        >
          Transactions
        </Typography>
        <Stack flexDirection="row" gap="10px" alignItems="center">
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
        </Stack>
      </Stack>
      <Stack gap="15px">
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: "none",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={headerCellStyle}>Customer</TableCell>
                <TableCell sx={headerCellStyle}>Order ID</TableCell>
                <TableCell sx={headerCellStyle}>Date & Time</TableCell>
                <TableCell sx={{ ...headerCellStyle, textAlign: "right" }}>
                  Amount
                </TableCell>
                <TableCell sx={{ ...headerCellStyle, textAlign: "center" }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transaction, index) => {
                  const statusStyle = getStatusColor(transaction.status);
                  return (
                    <TableRow
                      key={index}
                      onClick={() => handleRowClick(transaction)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "var(--bg-color)",
                          transform: "scale(1.001)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <TableCell sx={cellStyle}>
                        <Stack direction="row" gap="12px" alignItems="center">
                          <Avatar
                            sx={{
                              width: 42,
                              height: 42,
                              fontSize: "16px",
                              bgcolor: "var(--primary-color)",
                              fontWeight: 700,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                          >
                            {transaction.userMeta.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Stack>
                            <Typography
                              sx={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "var(--text1)",
                                lineHeight: 1.4,
                              }}
                            >
                              {transaction.userMeta.name}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "12px",
                                color: "var(--text3)",
                                lineHeight: 1.4,
                              }}
                            >
                              {transaction.userMeta.email}
                            </Typography>
                          </Stack>
                        </Stack>
                      </TableCell>
                      <TableCell sx={cellStyle}>
                        <Typography
                          sx={{
                            fontFamily: "monospace",
                            fontWeight: 600,
                            color: "var(--text2)",
                            fontSize: "13px",
                          }}
                        >
                          #{transaction.order.id}
                        </Typography>
                      </TableCell>
                      <TableCell sx={cellStyle}>
                        <Stack gap="4px">
                          <Typography
                            sx={{
                              fontSize: "13px",
                              color: "var(--text2)",
                              lineHeight: 1.4,
                            }}
                          >
                            {new Date(transaction.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "11px",
                              color: "var(--text3)",
                              lineHeight: 1.4,
                            }}
                          >
                            {new Date(transaction.createdAt).toLocaleTimeString(
                              "en-IN",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ ...cellStyle, textAlign: "right" }}>
                        <Typography
                          sx={{
                            fontSize: "16px",
                            fontWeight: 700,
                            color: "var(--text1)",
                          }}
                        >
                          ₹{transaction.amount.toLocaleString("en-IN")}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ ...cellStyle, textAlign: "center" }}>
                        <Chip
                          label={transaction.status}
                          size="small"
                          sx={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            fontWeight: 600,
                            fontSize: "11px",
                            borderRadius: "6px",
                            textTransform: "capitalize",
                            height: "24px",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={transactions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: "1px solid var(--border-color)",
            }}
          />
        </TableContainer>
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={handleDrawerClose}
          PaperProps={{
            sx: {
              width: "500px",
              maxWidth: "100%",
              display: "flex",
              flexDirection: "column",
            },
          }}
          sx={{ zIndex: 1300 }}
        >
          {selectedUser ? (
            <>
              {/* Header */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  p: 3,
                  borderBottom: "1px solid var(--border-color)",
                  bgcolor: "var(--bg-color)",
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                }}
              >
                <Stack direction="row" gap={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: "var(--primary-color)",
                      fontSize: "20px",
                      fontWeight: 700,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  >
                    {selectedUser.userMeta.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Stack>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "var(--text1)",
                        lineHeight: 1.2,
                      }}
                    >
                      {selectedUser.userMeta.name}
                    </Typography>
                    <Stack direction="row" gap={0.5} alignItems="center">
                      <Email sx={{ fontSize: 14, color: "var(--text3)" }} />
                      <Typography
                        variant="body2"
                        sx={{ color: "var(--text3)", fontSize: "13px" }}
                      >
                        {selectedUser.userMeta.email}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
                <IconButton
                  onClick={handleDrawerClose}
                  sx={{ color: "var(--text2)" }}
                >
                  <Close />
                </IconButton>
              </Stack>

              {/* Content */}
              <Box sx={{ p: 3, overflowY: "auto", flex: 1 }}>
                <Stack gap={3}>
                  {/* Status Banner */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: getStatusColor(selectedUser.status).bg,
                      border: `1px solid ${
                        getStatusColor(selectedUser.status).color
                      }30`,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    {selectedUser.status === "completed" ? (
                      <CheckCircle
                        sx={{
                          color: getStatusColor(selectedUser.status).color,
                        }}
                      />
                    ) : selectedUser.status === "cancelled" ||
                      selectedUser.status === "refunded" ? (
                      <Cancel
                        sx={{
                          color: getStatusColor(selectedUser.status).color,
                        }}
                      />
                    ) : (
                      <ErrorIcon
                        sx={{
                          color: getStatusColor(selectedUser.status).color,
                        }}
                      />
                    )}
                    <Stack>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: getStatusColor(selectedUser.status).color,
                          textTransform: "capitalize",
                        }}
                      >
                        {selectedUser.status} Transaction
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "var(--text2)" }}
                      >
                        {selectedUser.status === "completed"
                          ? "Payment successfully processed"
                          : `Transaction is ${selectedUser.status}`}
                      </Typography>
                    </Stack>
                  </Paper>

                  {/* Order Details */}
                  <Stack gap={1.5}>
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "var(--text3)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Order Details
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        border: "1px solid var(--border-color)",
                        borderRadius: "12px",
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Stack gap={0.5}>
                            <Typography variant="caption" color="var(--text3)">
                              Order ID
                            </Typography>
                            <Stack direction="row" alignItems="center" gap={1}>
                              <Typography fontWeight={600} fontSize="14px">
                                #{selectedUser.order.id}
                              </Typography>
                              <Tooltip title="Copy Order ID">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      selectedUser.order.id
                                    );
                                    enqueueSnackbar("Order ID copied", {
                                      variant: "success",
                                    });
                                  }}
                                >
                                  <ContentCopy sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Stack>
                        </Grid>
                        <Grid item xs={6}>
                          <Stack gap={0.5}>
                            <Typography variant="caption" color="var(--text3)">
                              Date & Time
                            </Typography>
                            <Typography fontWeight={600} fontSize="14px">
                              {new Date(selectedUser.createdAt).toLocaleString(
                                "en-IN",
                                {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                }
                              )}
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Stack>

                  {/* Customer Details */}
                  <Stack gap={1.5}>
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "var(--text3)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Customer Information
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        border: "1px solid var(--border-color)",
                        borderRadius: "12px",
                      }}
                    >
                      <Stack gap={2}>
                        <Stack direction="row" gap={2} alignItems="center">
                          <Phone sx={{ color: "var(--text3)", fontSize: 20 }} />
                          <Stack>
                            <Typography variant="caption" color="var(--text3)">
                              Phone Number
                            </Typography>
                            <Typography fontWeight={500} fontSize="14px">
                              {selectedUser.userMeta.billingInfo?.phone ||
                                "N/A"}
                            </Typography>
                          </Stack>
                        </Stack>
                        <Divider />
                        <Stack direction="row" gap={2} alignItems="center">
                          <LocationOn
                            sx={{ color: "var(--text3)", fontSize: 20 }}
                          />
                          <Stack>
                            <Typography variant="caption" color="var(--text3)">
                              Billing Address
                            </Typography>
                            <Typography fontWeight={500} fontSize="14px">
                              {[
                                selectedUser.userMeta.billingInfo?.city,
                                selectedUser.userMeta.billingInfo?.state,
                              ]
                                .filter(Boolean)
                                .join(", ") || "N/A"}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Paper>
                  </Stack>

                  {/* Payment Details */}
                  <Stack gap={1.5}>
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "var(--text3)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Payment Information
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        border: "1px solid var(--border-color)",
                        borderRadius: "12px",
                      }}
                    >
                      <Stack gap={2}>
                        <Stack direction="row" justifyContent="space-between">
                          <Stack direction="row" gap={2} alignItems="center">
                            <CreditCard
                              sx={{ color: "var(--text3)", fontSize: 20 }}
                            />
                            <Stack>
                              <Typography
                                variant="caption"
                                color="var(--text3)"
                              >
                                Payment Method
                              </Typography>
                              <Typography fontWeight={500} fontSize="14px">
                                {selectedUser.paymentDetails?.method ||
                                  "Online"}
                              </Typography>
                            </Stack>
                          </Stack>
                          <Stack alignItems="flex-end">
                            <Typography variant="caption" color="var(--text3)">
                              Amount
                            </Typography>
                            <Typography
                              fontWeight={700}
                              fontSize="16px"
                              color="var(--primary-color)"
                            >
                              ₹{selectedUser.amount?.toLocaleString("en-IN")}
                            </Typography>
                          </Stack>
                        </Stack>
                        <Divider />
                        <Stack gap={0.5}>
                          <Typography variant="caption" color="var(--text3)">
                            Transaction ID
                          </Typography>
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Typography
                              fontWeight={500}
                              fontSize="13px"
                              sx={{
                                fontFamily: "monospace",
                                wordBreak: "break-all",
                              }}
                            >
                              {selectedUser.paymentDetails?.razorpayPaymentId ||
                                "N/A"}
                            </Typography>
                            {selectedUser.paymentDetails?.razorpayPaymentId && (
                              <Tooltip title="Copy Transaction ID">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      selectedUser.paymentDetails
                                        .razorpayPaymentId
                                    );
                                    enqueueSnackbar("Transaction ID copied", {
                                      variant: "success",
                                    });
                                  }}
                                >
                                  <ContentCopy sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </Stack>
                      </Stack>
                    </Paper>
                  </Stack>

                  {/* Refund Details (Conditional) */}
                  {selectedUser.status === "refunded" && (
                    <Stack gap={1.5}>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "var(--delete-color)",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Refund Details
                      </Typography>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: "#FFEBEE",
                          border: "1px solid #FFCDD2",
                          borderRadius: "12px",
                        }}
                      >
                        <Stack gap={1}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography
                              variant="body2"
                              color="var(--delete-color)"
                            >
                              Refunded Amount
                            </Typography>
                            <Typography
                              fontWeight={700}
                              color="var(--delete-color)"
                            >
                              ₹{selectedUser.paymentDetails?.refundedAmount}
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography
                              variant="body2"
                              color="var(--delete-color)"
                            >
                              Refund ID
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color="var(--delete-color)"
                            >
                              {selectedUser.paymentDetails?.refundId}
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography
                              variant="body2"
                              color="var(--delete-color)"
                            >
                              Date
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color="var(--delete-color)"
                            >
                              {new Date(
                                selectedUser.paymentDetails?.refundedAt
                              ).toLocaleDateString()}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Paper>
                    </Stack>
                  )}
                </Stack>
              </Box>

              {/* Footer */}
              <Stack
                p={3}
                gap={2}
                sx={{
                  borderTop: "1px solid var(--border-color)",
                  bgcolor: "var(--bg-color)",
                  position: "sticky",
                  bottom: 0,
                  zIndex: 10,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography sx={{ color: "var(--text2)", fontWeight: 600 }}>
                    Total Amount
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "24px",
                      fontWeight: 800,
                      color: "var(--text1)",
                    }}
                  >
                    ₹{selectedUser.amount?.toLocaleString("en-IN")}
                  </Typography>
                </Stack>
                {selectedUser.status === "completed" ? (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Print />}
                        onClick={handlePrint}
                        sx={{
                          height: "44px",
                          borderRadius: "8px",
                          textTransform: "none",
                          fontWeight: 600,
                          borderColor: "var(--border-color)",
                          color: "var(--text1)",
                        }}
                      >
                        Print Invoice
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        onClick={handleRefund}
                        disabled={loading}
                        sx={{
                          height: "44px",
                          borderRadius: "8px",
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        {loading ? (
                          <CircularProgress size={20} />
                        ) : (
                          "Process Refund"
                        )}
                      </Button>
                    </Grid>
                  </Grid>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleDrawerClose}
                    sx={{
                      height: "44px",
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: 600,
                      bgcolor: "var(--primary-color)",
                      boxShadow: "none",
                    }}
                  >
                    Close
                  </Button>
                )}
              </Stack>
            </>
          ) : (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100%"
            >
              <CircularProgress />
            </Box>
          )}
        </Drawer>
      </Stack>
    </Stack>
  );
}
