"use client";
import dynamic from "next/dynamic";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import BatchCard from "@/src/components/BatchCard/BatchCard";
import Header from "@/src/components/Header/Header";
import InstituteDetailHeader from "./Components/InstituteDetailHeader";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import { apiFetch } from "@/src/lib/apiFetch";
import { Stack, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

import DeleteConfirmationDialog from "@/src/components/DeleteConfirmationDialog/DeleteConfirmationDialog";

const CreateBatchDialog = dynamic(() =>
  import("./Components/CreateBatchDialog")
);

export default function InstituteID() {
  const router = useRouter();
  const params = useParams();
  const instituteID = params.instituteID;
  const { showSnackbar } = useSnackbar();
  const [isDialogOpen, setIsDialogOPen] = useState(false);
  const [batch, setBatch] = useState({});
  const [batchList, setBatchList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingBatch, setEditingBatch] = useState(null);
  const [deletingBatch, setDeletingBatch] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const dialogOpen = () => {
    setEditingBatch(null);
    setIsDialogOPen(true);
  };
  const dialogClose = () => {
    setIsDialogOPen(false);
    setEditingBatch(null);
  };

  const fetchBatch = useCallback(
    async (signal) => {
      try {
        setIsLoading(true);
        const abortSignal = signal instanceof AbortSignal ? signal : null;
        const data = await apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/${instituteID}/get-all-batch`,
          { signal: abortSignal }
        );
        if (data.success) {
          setBatch(data.data);
          setBatchList(data.data.batchList);
        } else {
          showSnackbar(data.message, "error", "", "3000");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.log(err);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [instituteID, showSnackbar]
  );

  const handleCreateOrUpdateBatch = useCallback(
    async ({ title }) => {
      const controller = new AbortController();
      const isEdit = !!editingBatch;
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/batch/update`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/${instituteID}/create-batch`;

      const body = isEdit ? { batchID: editingBatch.id, title } : { title };

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
          fetchBatch();
          setIsDialogOPen(false);
          setEditingBatch(null);
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
    [instituteID, fetchBatch, showSnackbar, editingBatch]
  );

  const handleDeleteBatch = async () => {
    if (!deletingBatch) return;
    setIsDeleteLoading(true);
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/batch/delete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ batchID: deletingBatch.id }),
        }
      );

      if (data.success) {
        showSnackbar(data.message, "success", "", "3000");
        fetchBatch();
        setIsDeleteDialogOpen(false);
        setDeletingBatch(null);
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
    } catch (error) {
      showSnackbar("An error occurred", "error", "", "3000");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleEditBatch = (batchItem) => {
    setEditingBatch(batchItem);
    setIsDialogOPen(true);
  };

  const handleDeleteClick = (batchItem) => {
    setDeletingBatch(batchItem);
    setIsDeleteDialogOpen(true);
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchBatch(controller.signal);
    return () => controller.abort();
  }, [fetchBatch]);

  return (
    <Stack padding="20px" gap="20px">
      <InstituteDetailHeader
        instituteName={batch?.instituteMeta?.title}
        instituteEmail={batch?.instituteMeta?.email}
        batchCount={batchList.length}
        onCreateBatch={dialogOpen}
        isLoading={isLoading}
      />
      <Stack
        sx={{
          border: "1px solid var(--border-color)",
          borderRadius: "10px",
          padding: "20px",
          backgroundColor: "var(--white)",
          minHeight: "83vh",
        }}
      >
        <Stack gap="15px">
          <Stack flexDirection="row" justifyContent="space-between">
            <Typography
              sx={{ fontFamily: "Lato", fontSize: "20px", fontWeight: "700" }}
            >
              Batches
            </Typography>
          </Stack>
          <Stack
            flexDirection="row"
            flexWrap="wrap"
            rowGap="15px"
            columnGap="40px"
          >
            {!isLoading ? (
              batchList.length > 0 ? (
                batchList.map((item, index) => (
                  <BatchCard
                    key={index}
                    batch={item}
                    instituteID={instituteID}
                    onEdit={handleEditBatch}
                    onDelete={handleDeleteClick}
                  />
                ))
              ) : (
                <Stack width="100%" minHeight="60vh">
                  <NoDataFound info="No batches added" />
                </Stack>
              )
            ) : (
              Array.from({ length: 3 }).map((_, index) => (
                <SecondaryCardSkeleton key={index} />
              ))
            )}
          </Stack>
        </Stack>
      </Stack>
      <CreateBatchDialog
        open={isDialogOpen}
        onClose={dialogClose}
        onSubmit={handleCreateOrUpdateBatch}
        isLoading={isLoading}
        initialData={editingBatch}
      />
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteBatch}
        title="Delete Batch"
        description={`Are you sure you want to delete "${deletingBatch?.title}"? This will also remove all student enrollments associated with this batch.`}
        isLoading={isDeleteLoading}
      />
    </Stack>
  );
}
