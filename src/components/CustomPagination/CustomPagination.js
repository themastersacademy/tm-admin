import React from "react";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { useRouter } from "next/navigation";

const CustomPagination = ({ count, page, onPageChange }) => {
  const router = useRouter();

  const handleChange = (event, value) => {
    onPageChange(value);
    router.push(`?page=${value}`);
  };

  return (
    <Stack spacing={2} alignItems="center">
      <Pagination
        count={count}
        page={page} 
        onChange={handleChange}
        variant="outlined"
        shape="rounded"
        size="medium"
        sx={{
          "& .MuiPaginationItem-root": {
            borderColor:"var(--primary-color)"
          },
          "& .Mui-selected": {
            backgroundColor: "var(--primary-color-acc-2)", 
          },
        }}
      />
    </Stack>
  );
};

export default CustomPagination;
