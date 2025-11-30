import {
  Drawer,
  Stack,
  Avatar,
  Typography,
  IconButton,
  Box,
  Paper,
  Grid,
  Tooltip,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  Close,
  Email,
  CheckCircle,
  Cancel,
  Error as ErrorIcon,
  ContentCopy,
  Phone,
  LocationOn,
  CreditCard,
  Print,
} from "@mui/icons-material";

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

const TransactionDrawer = ({
  open,
  onClose,
  transaction,
  onPrint,
  onRefund,
  onVerify,
  loading,
  enqueueSnackbar,
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
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
      {transaction ? (
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
                {transaction.userMeta.name.charAt(0).toUpperCase()}
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
                  {transaction.userMeta.name}
                </Typography>
                <Stack direction="row" gap={0.5} alignItems="center">
                  <Email sx={{ fontSize: 14, color: "var(--text3)" }} />
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--text3)", fontSize: "13px" }}
                  >
                    {transaction.userMeta.email}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
            <IconButton onClick={onClose} sx={{ color: "var(--text2)" }}>
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
                  bgcolor: getStatusColor(transaction.status).bg,
                  border: `1px solid ${
                    getStatusColor(transaction.status).color
                  }30`,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                {transaction.status === "completed" ? (
                  <CheckCircle
                    sx={{
                      color: getStatusColor(transaction.status).color,
                    }}
                  />
                ) : transaction.status === "cancelled" ||
                  transaction.status === "refunded" ? (
                  <Cancel
                    sx={{
                      color: getStatusColor(transaction.status).color,
                    }}
                  />
                ) : (
                  <ErrorIcon
                    sx={{
                      color: getStatusColor(transaction.status).color,
                    }}
                  />
                )}
                <Stack>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: getStatusColor(transaction.status).color,
                      textTransform: "capitalize",
                    }}
                  >
                    {transaction.status} Transaction
                  </Typography>
                  <Typography variant="caption" sx={{ color: "var(--text2)" }}>
                    {transaction.status === "completed"
                      ? "Payment successfully processed"
                      : `Transaction is ${transaction.status}`}
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
                            #{transaction.order.id}
                          </Typography>
                          <Tooltip title="Copy Order ID">
                            <IconButton
                              size="small"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  transaction.order.id
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
                          {new Date(transaction.createdAt).toLocaleString(
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
                          {transaction.userMeta.billingInfo?.phone || "N/A"}
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
                            transaction.userMeta.billingInfo?.city,
                            transaction.userMeta.billingInfo?.state,
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
                          <Typography variant="caption" color="var(--text3)">
                            Payment Method
                          </Typography>
                          <Typography fontWeight={500} fontSize="14px">
                            {transaction.paymentDetails?.method || "Online"}
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
                          ₹{transaction.amount?.toLocaleString("en-IN")}
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
                          {transaction.paymentDetails?.razorpayPaymentId ||
                            "N/A"}
                        </Typography>
                        {transaction.paymentDetails?.razorpayPaymentId && (
                          <Tooltip title="Copy Transaction ID">
                            <IconButton
                              size="small"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  transaction.paymentDetails.razorpayPaymentId
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
              {transaction.status === "refunded" && (
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
                        <Typography variant="body2" color="var(--delete-color)">
                          Refunded Amount
                        </Typography>
                        <Typography
                          fontWeight={700}
                          color="var(--delete-color)"
                        >
                          ₹{transaction.paymentDetails?.refundedAmount}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="var(--delete-color)">
                          Refund ID
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="var(--delete-color)"
                        >
                          {transaction.paymentDetails?.refundId}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="var(--delete-color)">
                          Date
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="var(--delete-color)"
                        >
                          {new Date(
                            transaction.paymentDetails?.refundedAt
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
                ₹{transaction.amount?.toLocaleString("en-IN")}
              </Typography>
            </Stack>
            {transaction.status === "completed" ? (
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Print />}
                    onClick={onPrint}
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
                    onClick={onRefund}
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
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={onVerify}
                    disabled={loading}
                    sx={{
                      height: "44px",
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: 600,
                      borderColor: "var(--border-color)",
                      color: "var(--text1)",
                    }}
                  >
                    {loading ? <CircularProgress size={20} /> : "Check Status"}
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={onClose}
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
                </Grid>
              </Grid>
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
  );
};

export default TransactionDrawer;
