import {
  Autocomplete,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MarkdownEditor from "@/src/components/MarkdownEditor/MarkdownEditor";
import ThumbnailUpload from "@/src/components/ThumbnailUpload/ThumbnailUpload";
import { useEffect, useState } from "react";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "@/src/app/context/SnackbarContext";

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
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <Stack gap="12px" sx={{ position: "relative" }}>
      {/* Sticky Action Bar */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(8px)",
          padding: "10px 0",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--text1)",
          }}
        >
          Course Details
        </Typography>
        <Button
          variant="contained"
          sx={{
            textTransform: "none",
            backgroundColor: "var(--primary-color)",
            padding: "5px 16px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
            height: "32px",
            opacity: isChanged ? 1 : 0.5,
            pointerEvents: isChanged ? "auto" : "none",
            "&:hover": { backgroundColor: "var(--primary-color-dark)" },
          }}
          onClick={handleSave}
          disableElevation
        >
          Save Changes
        </Button>
      </Stack>

      <Stack
        flexDirection="row"
        gap="12px"
        flexWrap="wrap"
        alignItems="flex-start"
      >
        {/* Left Column */}
        <Stack
          flex={2}
          minWidth="400px"
          gap="12px"
          sx={{
            padding: "14px",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
          }}
        >
          <Stack gap="4px">
            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "var(--text2)" }}>
              Course Title*
            </Typography>
            <StyledTextField
              placeholder="e.g., Advanced Physics for Grade 12"
              value={course.title || ""}
              onChange={(e) =>
                setCourse((prev) => ({ ...prev, title: e.target.value }))
              }
              fullWidth
            />
          </Stack>

          <Stack gap="4px" flex={1}>
            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "var(--text2)" }}>
              Course Description*
            </Typography>
            <MarkdownEditor
              value={course.description || ""}
              onChange={(val) =>
                setCourse((prev) => ({ ...prev, description: val }))
              }
              height="300px"
            />
          </Stack>
        </Stack>

        {/* Right Column */}
        <Stack flex={1} gap="12px" minWidth="260px">
          {/* Thumbnail */}
          <Stack
            gap="10px"
            sx={{
              padding: "14px",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
            }}
          >
            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "var(--text2)" }}>
              Thumbnail
            </Typography>
            <ThumbnailUpload course={course} setCourse={setCourse} />
          </Stack>

          {/* Language */}
          <Stack
            gap="4px"
            sx={{
              padding: "14px",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
            }}
          >
            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "var(--text2)" }}>
              Language
            </Typography>
            <Autocomplete
              multiple
              filterSelectedOptions
              size="small"
              options={["English", "Tamil", "Hindi", "Malayalam", "Telugu"]}
              value={course.language || []}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={course.language?.length ? "" : "Select languages"}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      fontSize: "13px",
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
                  fontSize: "11px",
                  height: "24px",
                },
              }}
            />
          </Stack>

          {/* Duration */}
          <Stack
            gap="4px"
            sx={{
              padding: "14px",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
            }}
          >
            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "var(--text2)" }}>
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
            />
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
