"use client";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { Edit } from "@mui/icons-material";
import { Avatar, Button, Stack, Typography } from "@mui/material";
import { useState } from "react";

export default function StudentProfile({ student }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: student.name || "",
    email: student.email || "",
    phoneNumber: student.phoneNumber || "",
    gender: student.gender || "",
  });
  console.log("student", student);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSave = () => {
    console.log("formData", formData);
  };

  return (
    <Stack
      sx={{
        gap: "15px",
        marginTop: "20px",
        width: "100%",
        minHeight: "70vh",
        border: "1px solid var(--border-color)",
        backgroundColor: "var(--white)",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <Stack flexDirection="row" justifyContent="space-between">
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "18px",
            fontWeight: "700",
            color: "var(--text3)",
          }}
        >
          Personal details
        </Typography>
        <Button
          variant="contained"
          startIcon={<Edit />}
          sx={{
            backgroundColor: "var(--primary-color)",
            textTransform: "none",
          }}
          onClick={handleSave}
          disableElevation
        >
          {isEditing ? "Save" : "Edit"}
        </Button>
      </Stack>
      <Avatar
        src={student.image}
        sx={{ width: "80px", height: "80px", fontSize: "40px" }}
      />
      <hr />
      <Stack gap="15px" width="100%">
        <Stack flexDirection="row" gap="5px" width="100%">
          <Typography sx={{ width: "100px" }}>Name</Typography>
          <Stack sx={{ width: "300px" }}>
            <StyledTextField
              placeholder="Enter Name"
              value={student.name || ""}
              onChange={handleChange(student.name)}
            />
          </Stack>
        </Stack>
        <Stack flexDirection="row" gap="5px">
          <Typography sx={{ width: "100px" }}>Email</Typography>
          <Stack sx={{ width: "300px" }}>
            <StyledTextField
              placeholder="Enter email"
              value={student.email || ""}
              onChange={handleChange("email")}
            />
          </Stack>
        </Stack>
        <Stack flexDirection="row" gap="5px">
          <Typography sx={{ width: "100px" }}>Phone</Typography>
          <Stack sx={{ width: "300px" }}>
            <StyledTextField
              placeholder="Enter number"
              value={student.phoneNumber || ""}
            />
          </Stack>
        </Stack>
        <Stack flexDirection="row" gap="5px">
          <Typography sx={{ width: "100px" }}>Gender</Typography>
          <Stack sx={{ width: "300px" }}>
            <StyledTextField
              placeholder="Enter gender"
              value={student.gender || ""}
            />
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
