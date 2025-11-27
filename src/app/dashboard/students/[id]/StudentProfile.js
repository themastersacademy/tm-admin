"use client";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import {
  Edit,
  Save,
  Person,
  School,
  Security,
  Delete,
  Block,
  VpnKey,
} from "@mui/icons-material";
import {
  Avatar,
  Button,
  Stack,
  Typography,
  Grid,
  Divider,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useState, useEffect } from "react";
import { enqueueSnackbar } from "notistack";
import { apiFetch } from "@/src/lib/apiFetch";

export default function StudentProfile({ student }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    gender: "",
    dob: "",
    address: "",
    school: "",
    grade: "",
    targetExam: "",
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || "",
        email: student.email || "",
        phoneNumber: student.phoneNumber || "",
        gender: student.gender || "",
        dob: student.studentMeta?.dob || "",
        address: student.studentMeta?.address || "",
        school: student.studentMeta?.school || "",
        grade: student.studentMeta?.grade || "",
        targetExam: student.studentMeta?.targetExam || "",
      });
    }
  }, [student]);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      // API call to update student profile
      // await apiFetch(...)
      setIsEditing(false);
      enqueueSnackbar("Profile updated successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to update profile", { variant: "error" });
    }
  };

  return (
    <Stack gap="24px" marginTop="20px">
      {/* Personal Information Section */}
      <SectionCard
        title="Personal Information"
        icon={<Person sx={{ color: "var(--primary-color)" }} />}
        action={
          <Button
            variant={isEditing ? "contained" : "outlined"}
            startIcon={isEditing ? <Save /> : <Edit />}
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            sx={{
              textTransform: "none",
              borderColor: "var(--primary-color)",
              color: isEditing ? "#fff" : "var(--primary-color)",
              backgroundColor: isEditing
                ? "var(--primary-color)"
                : "transparent",
              "&:hover": {
                backgroundColor: isEditing
                  ? "var(--primary-color-dark)"
                  : "var(--primary-color-acc-2)",
                borderColor: "var(--primary-color)",
              },
            }}
          >
            {isEditing ? "Save Changes" : "Edit Details"}
          </Button>
        }
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Field
              label="Full Name"
              value={formData.name}
              onChange={handleChange("name")}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Field
              label="Email Address"
              value={formData.email}
              onChange={handleChange("email")}
              disabled={true} // Email usually shouldn't be editable directly
              helperText="Contact support to change email"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Field
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange("phoneNumber")}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Field
              label="Gender"
              value={formData.gender}
              onChange={handleChange("gender")}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <Field
              label="Address"
              value={formData.address}
              onChange={handleChange("address")}
              disabled={!isEditing}
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </SectionCard>

      {/* Academic Details Section */}
      <SectionCard
        title="Academic Details"
        icon={<School sx={{ color: "#9C27B0" }} />}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Field
              label="School / College"
              value={formData.school}
              onChange={handleChange("school")}
              disabled={!isEditing}
              placeholder="Enter school name"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Field
              label="Grade / Year"
              value={formData.grade}
              onChange={handleChange("grade")}
              disabled={!isEditing}
              placeholder="e.g. 12th Grade"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Field
              label="Target Exam"
              value={formData.targetExam}
              onChange={handleChange("targetExam")}
              disabled={!isEditing}
              placeholder="e.g. JEE Mains"
            />
          </Grid>
        </Grid>
      </SectionCard>

      {/* Account Actions Section */}
      <SectionCard
        title="Account Actions"
        icon={<Security sx={{ color: "#F44336" }} />}
      >
        <Stack gap="16px">
          <ActionRow
            title="Reset Password"
            description="Send a password reset link to the student's email"
            buttonText="Send Reset Link"
            icon={<VpnKey />}
            onClick={() =>
              enqueueSnackbar("Reset link sent", { variant: "success" })
            }
          />
          <Divider />
          <ActionRow
            title="Block Student"
            description="Prevent this student from logging in or accessing courses"
            buttonText={student.status === "blocked" ? "Unblock" : "Block"}
            icon={<Block />}
            color="warning"
            onClick={() => console.log("Block user")}
          />
          <Divider />
          <ActionRow
            title="Delete Account"
            description="Permanently delete this student and all their data"
            buttonText="Delete"
            icon={<Delete />}
            color="error"
            onClick={() => console.log("Delete user")}
          />
        </Stack>
      </SectionCard>
    </Stack>
  );
}

// Helper Components
const SectionCard = ({ title, icon, children, action }) => (
  <Stack
    sx={{
      backgroundColor: "var(--white)",
      border: "1px solid var(--border-color)",
      borderRadius: "12px",
      overflow: "hidden",
    }}
  >
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      padding="16px 24px"
      sx={{
        borderBottom: "1px solid var(--border-color)",
        backgroundColor: "var(--bg-color)",
      }}
    >
      <Stack direction="row" gap="12px" alignItems="center">
        {icon}
        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--text1)",
            fontFamily: "Lato",
          }}
        >
          {title}
        </Typography>
      </Stack>
      {action}
    </Stack>
    <Stack padding="24px">{children}</Stack>
  </Stack>
);

const Field = ({ label, disabled, helperText, ...props }) => (
  <Stack gap="8px">
    <Typography
      sx={{
        fontSize: "13px",
        fontWeight: 600,
        color: "var(--text2)",
      }}
    >
      {label}
    </Typography>
    <StyledTextField
      fullWidth
      disabled={disabled}
      sx={{
        "& .MuiOutlinedInput-root": {
          backgroundColor: disabled ? "var(--bg-color)" : "var(--white)",
        },
      }}
      {...props}
    />
    {helperText && (
      <Typography sx={{ fontSize: "11px", color: "var(--text3)" }}>
        {helperText}
      </Typography>
    )}
  </Stack>
);

const ActionRow = ({
  title,
  description,
  buttonText,
  icon,
  color = "primary",
  onClick,
}) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    gap="20px"
  >
    <Stack>
      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: 600,
          color: "var(--text1)",
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontSize: "13px",
          color: "var(--text3)",
        }}
      >
        {description}
      </Typography>
    </Stack>
    <Button
      variant="outlined"
      color={color}
      startIcon={icon}
      onClick={onClick}
      sx={{ textTransform: "none", minWidth: "120px" }}
    >
      {buttonText}
    </Button>
  </Stack>
);
