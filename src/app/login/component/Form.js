"use client";
import { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useSnackbar } from "../../context/SnackbarContext";

export default function Form() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const savedEmail = localStorage.getItem("adminEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showSnackbar("Please fill in all fields", "error", "", "3000");
      return;
    }

    setIsLoading(true);

    if (rememberMe) {
      localStorage.setItem("adminEmail", email);
    } else {
      localStorage.removeItem("adminEmail");
    }

    await fetch(`/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          showSnackbar(data.message, "success", "", "3000");
          router.push("/dashboard");
          setIsLoading(false);
        } else {
          showSnackbar(data.message, "error", "", "3000");
          setIsLoading(false);
        }
      })
      .catch(() => {
        showSnackbar(
          "Something went wrong. Please try again.",
          "error",
          "",
          "3000"
        );
        setIsLoading(false);
      });
  };

  return (
    <form onSubmit={onSubmit}>
      <Stack
        sx={{
          width: "350px",
          gap: "20px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Stack gap={1}>
          <Typography
            component="label"
            htmlFor="email-input"
            sx={{ fontSize: "Lato", fontSize: "16px", fontWeight: "500" }}
          >
            Email
          </Typography>
          <TextField
            id="email-input"
            variant="outlined"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            sx={{
              "& .MuiInputBase-input": {
                "&::placeholder": {
                  fontFamily: "Lato",
                  fontSize: "16px",
                  fontWeight: "500",
                },
              },
              "& .MuiOutlinedInput-root": {
                width: "350px",
                height: "40px",
                "&.Mui-focused fieldset": {
                  borderColor: "var(--sec-color)",
                  borderWidth: "1px",
                },
                "&:hover fieldset": {
                  borderColor: "var(--sec-color)",
                },
              },
            }}
          />
        </Stack>
        <Stack gap={1}>
          <Typography
            component="label"
            htmlFor="password-input"
            sx={{ fontSize: "Lato", fontSize: "16px", fontWeight: "500" }}
          >
            Password
          </Typography>
          <TextField
            id="password-input"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiInputBase-input": {
                "&::placeholder": {
                  fontFamily: "Lato",
                  fontSize: "16px",
                  fontWeight: "500",
                },
              },
              "& .MuiOutlinedInput-root": {
                width: "350px",
                height: "40px",
                "&.Mui-focused fieldset": {
                  borderColor: "var(--sec-color)",
                  borderWidth: "1px",
                },
                "&:hover fieldset": {
                  borderColor: "var(--sec-color)",
                },
              },
            }}
          />
        </Stack>

        <Stack width="100%" direction="row" alignItems="center">
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                sx={{
                  color: "var(--primary-color)",
                  "&.Mui-checked": {
                    color: "var(--primary-color)",
                  },
                }}
              />
            }
            label={
              <Typography
                sx={{
                  fontFamily: "Lato",
                  fontSize: "14px",
                  color: "var(--text1)",
                }}
              >
                Remember me
              </Typography>
            }
          />
        </Stack>

        <Stack>
          <Button
            type="submit"
            variant="contained"
            sx={{
              textTransform: "none",
              backgroundColor: "var(--primary-color)",
              borderRadius: "4px",
              fontFamily: "Lato",
              fontSize: "18px",
              height: "40px",
              width: "350px",
            }}
            disableElevation
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} sx={{ color: "var(--sec-color)" }} />
            ) : (
              "Sign In"
            )}
          </Button>
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "14px",
              paddingTop: "5px",
              textAlign: "center",
              color: "var(--text4)",
            }}
          >
            Please note: This is the company login page.
          </Typography>
        </Stack>
      </Stack>
    </form>
  );
}
