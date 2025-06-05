import DialogBox from "@/src/components/DialogBox/DialogBox";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import StyledSelect from "@/src/components/StyledSelect/StyledSelect";
import { apiFetch } from "@/src/lib/apiFetch";
import { Add, Close, Delete, East, Person } from "@mui/icons-material";
import {
  Button,
  DialogContent,
  IconButton,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";

export default function BatchStudents() {
  const params = useParams();
  const [studentsList, setStudentsList] = useState([]);
  const [studentDialog, setStudentDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [usersList, setUsersList] = useState([]);

  const studentDialogOpen = () => {
    setStudentDialog(true);
  };
  const studentDialogClose = () => {
    setStudentDialog(false);
  };

  const fetchStudents = () => {
    setIsLoading(true);
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/${params.instituteID}/${params.batchID}/get-all-students`
    ).then((data) => {
      if (data.success) {
        setStudentsList(data.data);
      }
      setIsLoading(false);
    });
  };

  const getAllUsers = () => {
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/get-all-users`
    ).then((data) => {
      if (data.success) {
        setUsersList(data.data);
      }
    });
  };

  useEffect(() => {
    fetchStudents();
    getAllUsers();
  }, []);

  const removeStudent = (userID) => {
    console.log(userID);

    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/${params.instituteID}/${params.batchID}/remove-student`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userID: userID }),
      }
    ).then((data) => {
      if (data.success) {
        fetchStudents();
      }
    });
  };

  return (
    <Stack
      sx={{
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        padding: "20px",
        backgroundColor: "var(--white)",
        minHeight: "80vh",
        gap: "20px",
        marginTop: "20px",
      }}
    >
      <Stack flexDirection="row" justifyContent="space-between">
        <Typography sx={{ fontSize: "20px", fontWeight: "700" }}>
          Students
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={studentDialogOpen}
          sx={{
            backgroundColor: "var(--primary-color)",
            textTransform: "none",
            fontFamily: "Lato",
          }}
          disableElevation
        >
          Students
        </Button>
      </Stack>
      <Stack flexDirection="row" flexWrap="wrap" rowGap="15px" columnGap="30px">
        {!isLoading ? (
          studentsList.length > 0 ? (
            studentsList.map((student, index) => (
              <SecondaryCard
                key={index}
                cardWidth="500px"
                title={student.studentMeta.name}
                subTitle={student.studentMeta.email}
                icon={
                  <Person
                    sx={{ color: "var(--sec-color)", fontSize: "26px" }}
                  />
                }
                options={[
                  <MenuItem
                    key="remove"
                    onClick={() => removeStudent(student.id)}
                    sx={{
                      padding: "4px",
                      fontSize: "14px",
                      color: "var(--delete-color)",
                      gap: "3px",
                    }}
                  >
                    <Delete sx={{ fontSize: "16px" }} />
                    Remove
                  </MenuItem>,
                ]}
              />
            ))
          ) : (
            <Stack width="100%" minHeight="60vh">
              <NoDataFound info="No students added" />
            </Stack>
          )
        ) : (
          <SecondaryCardSkeleton />
        )}
      </Stack>
      <StudentsDialog
        studentDialog={studentDialog}
        studentDialogClose={studentDialogClose}
        usersList={usersList}
        instituteID={params.instituteID}
        batchID={params.batchID}
        fetchStudents={fetchStudents}
      />
    </Stack>
  );
}

const StudentsDialog = ({
  studentDialog,
  studentDialogClose,
  usersList,
  instituteID,
  batchID,
  fetchStudents,
}) => {
  const [selectedStudent, setSelectedStudent] = useState("");
  const userOptions = usersList.map((user) => ({
    label: user.name,
    value: user.id,
  }));

  const addStudents = () => {
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/${instituteID}/${batchID}/add-student`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userID: selectedStudent }),
      }
    ).then((data) => {
      if (data.success) {
        fetchStudents();
        studentDialogClose();
        setSelectedStudent("");
        enqueueSnackbar("Student added to batch", {
          variant: "success",
        });
      } else {
        enqueueSnackbar(data.message, {
          variant: "error",
        });
      }
    });
  };

  return (
    <DialogBox
      title="Add Students"
      isOpen={studentDialog}
      icon={
        <IconButton
          onClick={studentDialogClose}
          sx={{ padding: "4px", borderRadius: "8px" }}
        >
          <Close />
        </IconButton>
      }
      actionButton={
        <Button
          variant="text"
          endIcon={<East />}
          onClick={addStudents}
          sx={{ textTransform: "none", color: "var(--primary-color)" }}
        >
          Add
        </Button>
      }
    >
      <DialogContent>
        <StyledSelect
          title="Select Student"
          value={selectedStudent || ""}
          options={userOptions}
          onChange={(e) => setSelectedStudent(e.target.value)}
          getLabel={(user) => user.label}
          getValue={(user) => user.value}
        />
      </DialogContent>
    </DialogBox>
  );
};
