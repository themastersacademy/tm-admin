"use client";
import { useState, useEffect } from "react";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import MarkdownEditor from "@/src/components/MarkdownEditor/MarkdownEditor";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import ThumbnailUpload from "@/src/components/ThumbnailUpload/ThumbnailUpload";
import { apiFetch } from "@/src/lib/apiFetch";
import {
  Autocomplete,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function Basic({ course, setCourse }) {
  const { showSnackbar } = useSnackbar();
  // Ensure initial values are defined to keep inputs controlled.
  const [initialBasic, setInitialBasic] = useState(course);
  const [isChanged, setIsChanged] = useState(false);

  // Set initialBasic only once on mount.
  useEffect(() => {
    setInitialBasic(course);
  }, []);

  // Check for changes using JSON stringify.
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
    <Stack marginTop="20px">
      <Stack gap="18px">
        <Stack gap="8px">
          <Typography
            sx={{ fontFamily: "Lato", fontSize: "14px", fontWeight: "700" }}
          >
            Course Title*
          </Typography>
          <StyledTextField
            placeholder="Enter the title of your course"
            value={course.title || ""}
            onChange={(e) =>
              setCourse((prev) => ({ ...prev, title: e.target.value }))
            }
          />
        </Stack>
        <Stack
          flexDirection="row"
          width="100%"
          justifyContent="space-between"
          gap="20px"
        >
          <Stack gap="8px" flex={1}>
            <Typography
              sx={{ fontFamily: "Lato", fontSize: "14px", fontWeight: "700" }}
            >
              Course Description*
            </Typography>
            <MarkdownEditor
              value={course.description || ""}
              onChange={(val) =>
                setCourse((prev) => ({ ...prev, description: val }))
              }
            />
          </Stack>
          <Stack flex={1} gap="30px">
            <Stack gap="8px">
              <Typography
                sx={{ fontFamily: "Lato", fontSize: "14px", fontWeight: "700" }}
              >
                Thumbnail
              </Typography>
              <ThumbnailUpload course={course} setCourse={setCourse} />
            </Stack>
            <Stack gap="12px">
              <Typography
                sx={{ fontFamily: "Lato", fontSize: "14px", fontWeight: "700" }}
              >
                Language
              </Typography>
              <Autocomplete
                multiple
                filterSelectedOptions
                options={["English", "Tamil"]}
                value={course.language || []}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select the language of the video"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": { borderColor: "var(--sec-color)" },
                        "&.Mui-focused fieldset, &.Mui-focusedWithPopper fieldset":
                          {
                            borderColor: "var(--sec-color) !important",
                            borderWidth: "1px",
                          },
                      },
                      "& .MuiInputLabel-root": { color: "gray" },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "var(--sec-color)",
                      },
                    }}
                  />
                )}
                onChange={(_, newValue) =>
                  setCourse((prev) => ({ ...prev, language: newValue }))
                }
                sx={{ "& .MuiChip-root": { height: "26px" } }}
              />
            </Stack>
            <Stack gap="8px">
              <Typography
                sx={{ fontFamily: "Lato", fontSize: "14px", fontWeight: "700" }}
              >
                Hours*
              </Typography>
              <StyledTextField
                placeholder="Enter hours"
                value={course.duration || ""}
                onChange={(e) =>
                  setCourse((prev) => ({ ...prev, duration: e.target.value }))
                }
              />
            </Stack>
          </Stack>
        </Stack>
        <Button
          variant="contained"
          sx={{
            textTransform: "none",
            backgroundColor: "var(--primary-color)",
            width: "110px",
          }}
          onClick={handleSave}
          disableElevation
          disabled={!isChanged}
        >
          Save
        </Button>
      </Stack>
    </Stack>
  );
}
