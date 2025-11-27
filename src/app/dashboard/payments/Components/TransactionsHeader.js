import SearchBox from "@/src/components/SearchBox/SearchBox";
import { Button, Stack, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

const TransactionsHeader = ({ onRefresh }) => {
  return (
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
          onClick={onRefresh}
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
  );
};

export default TransactionsHeader;
