"use client";
import { useState, useEffect } from "react";
import { Stack } from "@mui/material";
import InstituteHeader from "./Components/InstituteHeader";
import InstituteCard from "@/src/components/InstituteCard/InstituteCard";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import CreateInstituteDialog from "./Components/CreateInstituteDialog";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "../../context/SnackbarContext";

export default function Institute() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [instituteList, setInstituteList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const createInstitute = ({ title, email }) => {
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, email }),
    }).then((data) => {
      if (data.success) {
        showSnackbar(data.message, "success", "", "3000");
        fetchInstitute();
        setIsDialogOpen(false);
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
    });
  };

  const fetchInstitute = async () => {
    setIsLoading(true);
    await apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/get-all`
    ).then((data) => {
      if (data.success) {
        setInstituteList(data.data);
      } else {
        console.log(data.message);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchInstitute();
  }, []);

  const activeBatches = instituteList.reduce(
    (acc, curr) => acc + (curr.batchCount || 0),
    0
  );

  return (
    <Stack padding="20px" gap="20px">
      <InstituteHeader
        instituteCount={instituteList.length}
        activeBatches={activeBatches}
        onCreateClick={() => setIsDialogOpen(true)}
        isLoading={isLoading}
      />
      <Stack
        sx={{
          border: "1px solid var(--border-color)",
          backgroundColor: "var(--white)",
          borderRadius: "10px",
          padding: "20px",
          minHeight: "80vh",
        }}
      >
        <Stack flexDirection="row" gap="20px" flexWrap="wrap">
          {!isLoading ? (
            instituteList.length > 0 ? (
              instituteList.map((item, index) => (
                <InstituteCard key={index} institute={item} />
              ))
            ) : (
              <Stack width="100%" height="70vh">
                <NoDataFound info="No institute created yet" />
              </Stack>
            )
          ) : (
            Array.from({ length: 3 }).map((_, index) => (
              <SecondaryCardSkeleton key={index} />
            ))
          )}
        </Stack>
      </Stack>
      <CreateInstituteDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={createInstitute}
        isLoading={isLoading}
      />
    </Stack>
  );
}
