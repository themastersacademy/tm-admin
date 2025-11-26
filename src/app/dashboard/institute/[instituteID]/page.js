"use client";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import BatchCard from "@/src/components/BatchCard/BatchCard";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import Header from "@/src/components/Header/Header";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { apiFetch } from "@/src/lib/apiFetch";
import { Add, Close, East } from "@mui/icons-material";
import {
  Button,
  DialogContent,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function InstituteID() {
  const router = useRouter();
  const params = useParams();
  const instituteID = params.instituteID;
  const { showSnackbar } = useSnackbar();
  const [isDialogOpen, setIsDialogOPen] = useState(false);
  const [title, setTitle] = useState("");
  const [batch, setBatch] = useState({});
  const [batchList, setBatchList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const dialogOpen = () => {
    setIsDialogOPen(true);
  };
  const dialogClose = () => {
    setIsDialogOPen(false);
  };

  const createBatch = ({ title }) => {
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/${instituteID}/create-batch`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
        }),
      }
    ).then((data) => {
      if (data.success) {
        showSnackbar(data.message, "success", "", "3000");
        fetchBatch();
        setIsDialogOPen(false);
        setTitle("");
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
    });
  };

  const fetchBatch = async () => {
    try {
      setIsLoading(true);
      await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/${instituteID}/get-all-batch`
      ).then((data) => {
        if (data.success) {
          setBatch(data.data);
          setBatchList(data.data.batchList);
        } else {
          showSnackbar(data.message, "error", "", "3000");
        }
        setIsLoading(false);
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchBatch();
  }, []);

  return (
    <Stack padding="20px" gap="20px">
      <Header
        title={
          batch?.instituteMeta?.title || (
            <Skeleton variant="text" width="100px" />
          )
        }
        subtitle={
          batch?.instituteMeta?.email || (
            <Skeleton variant="text" width="150px" />
          )
        }
        search
        button={[
          <Button
            key="batch"
            variant="contained"
            startIcon={<Add />}
            onClick={dialogOpen}
            sx={{
              backgroundColor: "var(--primary-color)",
              textTransform: "none",
              width: "120px",
            }}
            disableElevation
          >
            Batch
          </Button>,
        ]}
        back
      />
      <DialogBox
        isOpen={isDialogOpen}
        onClose={dialogClose}
        title="Add Batch"
        actionButton={
          <Button
            variant="text"
            endIcon={<East />}
            onClick={() => createBatch({ title })}
            sx={{ textTransform: "none", color: "var(--primary-color)" }}
          >
            Create
          </Button>
        }
        icon={
          <IconButton
            onClick={dialogClose}
            sx={{ borderRadius: "8px", padding: "4px" }}
          >
            <Close sx={{ color: "var(--text2)" }} />
          </IconButton>
        }
      >
        <DialogContent>
          <StyledTextField
            placeholder="Batch Name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </DialogContent>
      </DialogBox>
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
    </Stack>
  );
}
