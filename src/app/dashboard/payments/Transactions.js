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
import { useEffect, useState, useCallback } from "react";
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
    if (!selectedUser) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const totalAmount = selectedUser.amount || 0;
    const baseAmount = (totalAmount / 1.18).toFixed(2);
    const cgst = ((totalAmount - baseAmount) / 2).toFixed(2);
    const sgst = ((totalAmount - baseAmount) / 2).toFixed(2);

    // Format invoice number with leading zeros
    const invoiceNo = selectedUser.order?.id || selectedUser.orderId || "N/A";
    const formattedInvoiceNo = `052/2025-${String(invoiceNo).padStart(4, "0")}`;

    // Format date
    const invoiceDate = selectedUser.createdAt
      ? new Date(selectedUser.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

    // Get course/subscription name
    const courseName =
      selectedUser.courseName ||
      selectedUser.subscriptionName ||
      "Complete Course on General Aptitude for All Competitive Exams and Campus Placements";

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Tax Invoice - ${formattedInvoiceNo}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              color: #000; 
              background: #fff; 
              line-height: 1.4; 
            }
            .invoice-container { 
              max-width: 210mm; 
              margin: 0 auto; 
              padding: 15px;
              border: 1px solid #000;
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start; 
              margin-bottom: 10px;
              padding-bottom: 10px;
              border-bottom: 2px solid #000;
            }
            .company-info { 
              flex: 1; 
            }
            .company-name { 
              font-size: 32px; 
              font-weight: bold; 
              color: #5BA4CF; 
              letter-spacing: 2px;
              margin-bottom: 5px;
            }
            .company-tagline {
              font-size: 11px;
              color: #5BA4CF;
              font-weight: bold;
              margin-bottom: 10px;
              letter-spacing: 0.5px;
            }
            .company-details {
              font-size: 11px;
              line-height: 1.6;
              color: #333;
            }
            .company-logo {
              width: 120px;
              height: auto;
            }
            .invoice-title {
              text-align: center;
              font-size: 24px;
              font-weight: bold;
              margin: 15px 0;
              color: #000;
            }
            .customer-section {
              border: 1px solid #000;
              padding: 10px;
              margin-bottom: 10px;
            }
            .customer-label {
              font-weight: bold;
              margin-bottom: 5px;
              font-size: 12px;
            }
            .customer-details {
              font-size: 11px;
              line-height: 1.6;
            }
            .invoice-details {
              display: flex;
              justify-content: space-between;
              border-left: 1px solid #000;
              border-right: 1px solid #000;
              border-bottom: 1px solid #000;
              padding: 8px 10px;
              font-size: 11px;
            }
            .invoice-no {
              color: #d9534f;
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
              border: 1px solid #000;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
              font-size: 11px;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
              text-align: center;
            }
            .text-center {
              text-align: center;
            }
            .text-right {
              text-align: right;
            }
            .total-row {
              font-weight: bold;
              background-color: #f9f9f9;
            }
            .note {
              font-size: 10px;
              font-style: italic;
              margin: 10px 0;
            }
            .validity-section {
              font-size: 10px;
              margin: 10px 0;
              padding: 8px;
              background-color: #f9f9f9;
              border-left: 3px solid #5BA4CF;
            }
            .footer-section {
              margin-top: 15px;
              padding-top: 10px;
              border-top: 1px solid #ccc;
            }
            .footer-title {
              font-size: 11px;
              font-weight: bold;
              margin-bottom: 5px;
              color: #333;
            }
            .footer-text {
              font-size: 9px;
              line-height: 1.5;
              color: #666;
            }
            .computer-generated {
              text-align: center;
              font-size: 10px;
              font-style: italic;
              margin-top: 20px;
              color: #999;
            }
            @media print { 
              body { padding: 0; } 
              .invoice-container { border: 1px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header -->
            <div class="header">
              <div class="company-info">
                <div class="company-name">THE MASTERS ACADEMY</div>
                <div class="company-tagline">GATE / ESE / TRB / TNEB / ISRO / IBPS / SSE / RRB / PLACEMENTS</div>
                <div class="company-details">
                  📍 No. 82, Vasantham Nagar, E.B. Colony,<br>
                  Saravanamapatti Post, Coimbatore – 641 035<br>
                  GSTIN: 33AAUFT3487G1ZD
                </div>
              </div>
              <div>
                <img src="/Images/Masters-logo.svg" alt="Masters Academy Logo" class="company-logo" onerror="this.style.display='none'">
                <div style="font-size: 10px; margin-top: 5px; text-align: right;">
                  +91 9952225825, 9629285139<br>
                  Mail: mastersacademyvsb@gmail.com<br>
                  team@themastersacademy.in<br>
                  Website: www.themastersacademy.in
                </div>
              </div>
            </div>

            <!-- Invoice Title -->
            <div class="invoice-title">Tax Invoice</div>

            <!-- Customer Section -->
            <div class="customer-section">
              <div class="customer-label">To</div>
              <div class="customer-details">
                ${selectedUser.userMeta?.name || "Customer"}<br>
                Email: ${selectedUser.userMeta?.email || "N/A"}<br>
                ${
                  selectedUser.userMeta?.billingInfo?.city
                    ? selectedUser.userMeta.billingInfo.city + ", "
                    : ""
                }
                ${selectedUser.userMeta?.billingInfo?.state || ""}<br>
                Mobile: ${
                  selectedUser.userMeta?.billingInfo?.phone ||
                  selectedUser.userMeta?.phone ||
                  "N/A"
                }
              </div>
            </div>

            <!-- Invoice Details -->
            <div class="invoice-details">
              <div>Invoice No.: <span class="invoice-no">${formattedInvoiceNo}</span></div>
              <div>Dated: ${invoiceDate}</div>
            </div>

            <!-- Items Table -->
            <table>
              <thead>
                <tr>
                  <th style="width: 8%;">S.No.</th>
                  <th style="width: 52%;">Particulars</th>
                  <th style="width: 15%;">HSN/SAC</th>
                  <th style="width: 25%;">Amount (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="text-center">1</td>
                  <td>${courseName}</td>
                  <td class="text-center">9992</td>
                  <td class="text-right">${parseFloat(baseAmount).toFixed(
                    2
                  )}</td>
                </tr>
                <tr>
                  <td colspan="3" class="text-right">CGST (9%)</td>
                  <td class="text-right">${cgst}</td>
                </tr>
                <tr>
                  <td colspan="3" class="text-right">SGST (9%)</td>
                  <td class="text-right">${sgst}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="3" class="text-center">Total Amount</td>
                  <td class="text-right">${totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <!-- Validity Note -->
            <div class="validity-section">
              <strong>Course Validity:</strong> ${
                selectedUser.validity ||
                selectedUser.courseDuration ||
                "6 months"
              } from the date of purchase
            </div>

            <!-- Refund Policy -->
            <div class="footer-section">
              <div class="footer-title">Refund Policy:</div>
              <div class="footer-text">
                • Refunds are processed only within 7 days of purchase, subject to terms and conditions.<br>
                • No refund will be issued after course access has been utilized beyond the trial period.<br>
                • Refund requests must be submitted via email to team@themastersacademy.in with valid reasons.<br>
                • Processing time for approved refunds: 7-10 business days.<br>
                • For detailed refund policy, please visit our website or contact support.
              </div>
            </div>

            <!-- Terms & Conditions -->
            <div class="footer-section">
              <div class="footer-title">Terms & Conditions:</div>
              <div class="footer-text">
                • Access to course materials will be provided within 24 hours of payment confirmation.<br>
                • All course content is proprietary and protected by copyright laws.<br>
                • Subscription cannot be transferred to another person.<br>
                • For any queries or support, contact us at team@themastersacademy.in or call +91 9952225825.
              </div>
            </div>

            <!-- Computer Generated Notice -->
            <div class="computer-generated">
              This is a computer-generated invoice. No signature required.<br>
              Generated on: ${new Date().toLocaleString("en-IN")}
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
  }, [fetchTransactions]);

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
