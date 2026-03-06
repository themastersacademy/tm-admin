"use client";
import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import { Box, Stack } from "@mui/material";
import InstituteHeader from "./Components/InstituteHeader";
import InstituteCard from "@/src/components/InstituteCard/InstituteCard";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "../../context/SnackbarContext";

const CreateInstituteDialog = dynamic(() =>
  import("./Components/CreateInstituteDialog")
);

export default function Institute() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [instituteList, setInstituteList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingInstitute, setEditingInstitute] = useState(null);

  const fetchInstitute = useCallback(async (signal) => {
    setIsLoading(true);
    try {
      const abortSignal = signal instanceof AbortSignal ? signal : null;
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/get-all`,
        { signal: abortSignal }
      );
      if (data.success) {
        setInstituteList(data.data);
      } else {
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching institutes:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreateOrUpdateInstitute = useCallback(
    async ({ title, email }) => {
      const controller = new AbortController();
      const isEdit = !!editingInstitute;
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/update`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/create`;

      const body = isEdit
        ? { instituteID: editingInstitute.id, title, email }
        : { title, email };

      try {
        const data = await apiFetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (data.success) {
          showSnackbar(data.message, "success", "", "3000");
          fetchInstitute();
          setIsDialogOpen(false);
          setEditingInstitute(null);
        } else {
          showSnackbar(data.message, "error", "", "3000");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          showSnackbar("An error occurred", "error", "", "3000");
        }
      }
      return () => controller.abort();
    },
    [fetchInstitute, showSnackbar, editingInstitute]
  );

  const handleEditInstitute = (institute) => {
    setEditingInstitute(institute);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingInstitute(null);
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchInstitute(controller.signal);
    return () => controller.abort();
  }, [fetchInstitute]);

  const activeBatches = instituteList.reduce(
    (acc, curr) => acc + (curr.batchCount || 0),
    0
  );

  return (
    <Stack padding="20px" gap="20px">
      <InstituteHeader
        instituteCount={instituteList.length}
        activeBatches={activeBatches}
        onCreateClick={() => {
          setEditingInstitute(null);
          setIsDialogOpen(true);
        }}
        isLoading={isLoading}
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "14px",
        }}
      >
        {!isLoading ? (
          instituteList.length > 0 ? (
            instituteList.map((item, index) => (
              <InstituteCard
                key={index}
                institute={item}
                onEdit={handleEditInstitute}
              />
            ))
          ) : (
            <Stack sx={{ gridColumn: "1 / -1", minHeight: "60vh" }}>
              <NoDataFound info="No institute created yet" />
            </Stack>
          )
        ) : (
          Array.from({ length: 4 }).map((_, index) => (
            <SecondaryCardSkeleton key={index} />
          ))
        )}
      </Box>
      <CreateInstituteDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleCreateOrUpdateInstitute}
        isLoading={isLoading}
        initialData={editingInstitute}
      />
    </Stack>
  );
}
