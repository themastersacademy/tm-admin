import {
  Avatar,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";

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

const TransactionsTable = ({
  transactions,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onRowClick,
}) => {
  return (
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
                  onClick={() => onRowClick(transaction)}
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
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        sx={{
          borderTop: "1px solid var(--border-color)",
        }}
      />
    </TableContainer>
  );
};

export default TransactionsTable;
