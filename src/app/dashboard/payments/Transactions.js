"use client";
import SearchBox from "@/src/components/SearchBox/SearchBox";
import { LocalMall, Print, Close } from "@mui/icons-material";
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
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  padding="16px 20px"
                  sx={{
                    borderBottom: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-color)",
                  }}
                >
                  <Stack
                    direction="row"
                    gap="12px"
                    alignItems="center"
                    flex={1}
                  >
                    <LocalMall
                      sx={{ color: "var(--primary-color)", fontSize: "24px" }}
                    />
                    <Stack>
                      <Typography
                        sx={{
                          fontFamily: "Lato",
                          fontSize: "18px",
                          fontWeight: 700,
                        }}
                      >
                        {selectedUser.userMeta.name}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "13px", color: "var(--text3)" }}
                      >
                        Transaction Details
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack direction="row" gap="8px" alignItems="center">
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
                        fontSize: "12px",
                        color: "white",
                        borderRadius: "6px",
                        textTransform: "capitalize",
                        fontWeight: 600,
                      }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<Print />}
                      onClick={handlePrint}
                      size="small"
                      sx={{
                        borderRadius: "8px",
                        textTransform: "none",
                        borderColor: "var(--border-color)",
                        color: "var(--text2)",
                        fontSize: "13px",
                      }}
                    >
                      Print Invoice
                    </Button>
                    <IconButton onClick={handleDrawerClose} size="small">
                      <Close />
                    </IconButton>
                  </Stack>
                </Stack>
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
