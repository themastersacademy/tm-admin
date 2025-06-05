"use client";
import { useState, useEffect } from "react";
import {
  Button,
  Stack,
  DialogContent,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Add, AccountBalance, East, Close } from "@mui/icons-material";
import Header from "@/src/components/Header/Header";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "../../context/SnackbarContext";

export default function Institute() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [instituteList, setInstituteList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");

  const createInstitute = () => {
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
        setTitle("");
        setEmail("");
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

  return (
    <Stack padding="20px" gap="20px">
      <Header
        title="Institute"
        button={[
          <Button
            key="addInstitute"
            variant="contained"
            startIcon={<Add />}
            onClick={() => setIsDialogOpen(true)}
            sx={{
              backgroundColor: "var(--primary-color)",
              textTransform: "none",
            }}
            disableElevation
          >
            Institute
          </Button>,
        ]}
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
                <SecondaryCard
                  key={index}
                  title={
                    <span
                      onClick={() => {
                        router.push(`/dashboard/institute/${item.id}`);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {item.title}
                    </span>
                  }
                  icon={<AccountBalance sx={{ color: "var(--sec-color)" }} />}
                  cardWidth="350px"
                />
              ))
            ) : (
              <Stack width="100%">
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
      <InstitutDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        createInstitute={createInstitute}
        title={title}
        setTitle={setTitle}
        email={email}
        setEmail={setEmail}
        isLoading={isLoading}
      />
    </Stack>
  );
}

const InstitutDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  createInstitute,
  title,
  setTitle,
  email,
  setEmail,
  isLoading,
}) => {
  return (
    <DialogBox
      isOpen={isDialogOpen}
      title="Institute"
      icon={
        <IconButton
          onClick={() => setIsDialogOpen(false)}
          sx={{ borderRadius: "8px", padding: "4px" }}
        >
          <Close sx={{ color: "var(--text2)" }} />
        </IconButton>
      }
      actionButton={
        <Button
          variant="text"
          endIcon={<East />}
          onClick={createInstitute}
          sx={{ textTransform: "none", color: "var(--primary-color)" }}
        >
          {isLoading ? (
            <CircularProgress
              size={20}
              sx={{ color: "var(--primary-color)" }}
            />
          ) : (
            "Create"
          )}
        </Button>
      }
    >
      <DialogContent>
        <Stack gap="15px">
          <StyledTextField
            placeholder="Institute name"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />
          <StyledTextField
            placeholder="Enter email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </Stack>
      </DialogContent>
    </DialogBox>
  );
};
