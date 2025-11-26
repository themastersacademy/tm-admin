import {
  Autocomplete,
  Button,
  Stack,
  TextField,
  Typography,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import MarkdownEditor from "@/src/components/MarkdownEditor/MarkdownEditor";
import ThumbnailUpload from "@/src/components/ThumbnailUpload/ThumbnailUpload";
import { useEffect, useState } from "react";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import {
  InfoOutlined,
  Image as ImageIcon,
  Settings,
} from "@mui/icons-material";

export default function Basic({ course, setCourse }) {
  const { showSnackbar } = useSnackbar();
  const [initialBasic, setInitialBasic] = useState(course);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    setInitialBasic(course);
  }, []);

  useEffect(() => {
    setIsChanged(JSON.stringify(course) !== JSON.stringify(initialBasic));
  }, [course, initialBasic]);

  const handleSave = async () => {
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/courses/update/basic-info`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseID: course.id,
            goalID: course.goalID,
            title: course.title || "",
            description: course.description || "",
            thumbnail: course.thumbnail || "",
            language: course.language || [],
            duration: course.duration || "",
          }),
        }
      );
      if (data) {
        setInitialBasic(course);
        showSnackbar(data.message, "success", "", "3000");
        setIsChanged(false);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <Stack gap="24px" sx={{ position: "relative" }}>
      {/* Sticky Action Bar */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(8px)",
          padding: "16px 0",
          borderBottom: "1px solid var(--border-color)",
          marginBottom: "16px",
        }}
      >
        <Stack gap="4px">
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text1)",
            }}
          >
            Course Overview
          </Typography>
          <Typography
            sx={{ fontFamily: "Lato", fontSize: "14px", color: "var(--text3)" }}
          >
            Manage your course's core details and settings
          </Typography>
        </Stack>
        <Button
          variant="contained"
          sx={{
            textTransform: "none",
            backgroundColor: "var(--primary-color)",
            padding: "8px 24px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            opacity: isChanged ? 1 : 0.6,
            pointerEvents: isChanged ? "auto" : "none",
          }}
          onClick={handleSave}
          disableElevation
        >
          Save Changes
        </Button>
      </Stack>

      <Stack
        flexDirection="row"
        gap="24px"
        flexWrap="wrap"
        alignItems="flex-start"
      >
        {/* Left Column - General Information */}
        <Card
          elevation={0}
          sx={{
            flex: 2,
            minWidth: "400px",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
          }}
        >
          <CardContent sx={{ padding: "24px" }}>
            <Stack gap="24px">
              <Stack direction="row" gap="12px" alignItems="center">
                <InfoOutlined sx={{ color: "var(--primary-color)" }} />
                <Typography
                  sx={{
                    fontFamily: "Lato",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "var(--text1)",
                  }}
                >
                  General Information
                </Typography>
              </Stack>
              <Divider />

              <Stack gap="8px">
                <Typography
                  sx={{
                    fontFamily: "Lato",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "var(--text1)",
                  }}
                >
                  Course Title*
                </Typography>
                <StyledTextField
                  placeholder="e.g., Advanced Physics for Grade 12"
                  value={course.title || ""}
                  onChange={(e) =>
                    setCourse((prev) => ({ ...prev, title: e.target.value }))
                  }
                  fullWidth
                  helperText="This title will be displayed on the course card and details page."
                />
              </Stack>

              <Stack gap="8px" flex={1}>
                <Typography
                  sx={{
                    fontFamily: "Lato",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "var(--text1)",
                  }}
                >
                  Course Description*
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Lato",
                    fontSize: "12px",
                    color: "var(--text3)",
                    mb: 1,
                  }}
                >
                  Provide a comprehensive overview of what students will learn
                  in this course.
                </Typography>
                <MarkdownEditor
                  value={course.description || ""}
                  onChange={(val) =>
                    setCourse((prev) => ({ ...prev, description: val }))
                  }
                  height="400px"
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Right Column - Media & Settings */}
        <Stack flex={1} gap="24px" minWidth="300px">
          {/* Media Card */}
          <Card
            elevation={0}
            sx={{
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
            }}
          >
            <CardContent sx={{ padding: "24px" }}>
              <Stack gap="24px">
                <Stack direction="row" gap="12px" alignItems="center">
                  <ImageIcon sx={{ color: "var(--primary-color)" }} />
                  <Typography
                    sx={{
                      fontFamily: "Lato",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "var(--text1)",
                    }}
                  >
                    Course Media
                  </Typography>
                </Stack>
                <Divider />

                <Stack gap="8px">
                  <Typography
                    sx={{
                      fontFamily: "Lato",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--text1)",
                    }}
                  >
                    Thumbnail
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Lato",
                      fontSize: "12px",
                      color: "var(--text3)",
                      mb: 1,
                    }}
                  >
                    Upload a high-quality image (16:9 ratio recommended).
                  </Typography>
                  <ThumbnailUpload course={course} setCourse={setCourse} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card
            elevation={0}
            sx={{
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
            }}
          >
            <CardContent sx={{ padding: "24px" }}>
              <Stack gap="24px">
                <Stack direction="row" gap="12px" alignItems="center">
                  <Settings sx={{ color: "var(--primary-color)" }} />
                  <Typography
                    sx={{
                      fontFamily: "Lato",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "var(--text1)",
                    }}
                  >
                    Configuration
                  </Typography>
                </Stack>
                <Divider />

                <Stack gap="8px">
                  <Typography
                    sx={{
                      fontFamily: "Lato",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--text1)",
                    }}
                  >
                    Language
                  </Typography>
                  <Autocomplete
                    multiple
                    filterSelectedOptions
                    options={[
                      "English",
                      "Tamil",
                      "Hindi",
                      "Malayalam",
                      "Telugu",
                    ]}
                    value={course.language || []}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={
                          course.language?.length ? "" : "Select languages"
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            backgroundColor: "var(--bg-color)",
                            "& fieldset": { border: "none" },
                          },
                        }}
                      />
                    )}
                    onChange={(_, newValue) =>
                      setCourse((prev) => ({ ...prev, language: newValue }))
                    }
                    sx={{
                      "& .MuiChip-root": {
                        borderRadius: "6px",
                        fontFamily: "Lato",
                      },
                    }}
                  />
                </Stack>

                <Stack gap="8px">
                  <Typography
                    sx={{
                      fontFamily: "Lato",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--text1)",
                    }}
                  >
                    Duration (Hours)*
                  </Typography>
                  <StyledTextField
                    placeholder="e.g. 12.5"
                    value={course.duration || ""}
                    onChange={(e) =>
                      setCourse((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    type="number"
                    helperText="Total estimated duration of the course content."
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Stack>
    </Stack>
  );
}
