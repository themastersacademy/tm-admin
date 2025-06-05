"use client";
import React, { createContext, useState, useContext, useCallback } from "react";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Alert, CircularProgress, styled } from "@mui/material";
import {
  SnackbarProvider as SnackbarProvider2,
  MaterialDesignContent,
} from "notistack";

const StyledMaterialDesignContent = styled(MaterialDesignContent)(() => ({
  "&.notistack-MuiContent-success": {
    backgroundColor: "var(--primary-color)",
  },
  "&.notistack-MuiContent-error": {
    backgroundColor: "var(--delete-color)",
  },
  "&.notistack-MuiContent-info": {
    backgroundColor: "var(--info-color)",
    // color: "#B5C7EB",
  },
  "&.notistack-MuiContent-warning": {
    backgroundColor: "var(--sec-color-acc-2)",
    color: "var(--sec-color)",
  },
  "&.notistack-MuiContent-loading": {
    backgroundColor: "var(--primary-color-acc-2)",
    color: "var(--primary-color)",
  },
}));

const SnackbarContext = createContext();

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: undefined,
    icon: null,
    autoHideDuration: null,
  });

  const showSnackbar = useCallback(
    (message, severity, icon = null, autoHideDuration = 6000) => {
      setSnackbar({
        open: true,
        message,
        severity,
        icon,
        autoHideDuration: icon ? null : autoHideDuration,
      });
    },
    []
  );

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({
      open: false,
      message: "",
      severity: undefined,
      icon: null,
      autoHideDuration: null,
    });
  };

  return (
    <SnackbarProvider2
      maxSnack={3}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      autoHideDuration={3000}
      iconVariant={{
        loading: (
          <CircularProgress
            size={20}
            sx={{ marginRight: "10px" }}
            color="inherit"
          />
        ),
      }}
      Components={{
        success: StyledMaterialDesignContent,
        error: StyledMaterialDesignContent,
        loading: StyledMaterialDesignContent,
        warning: StyledMaterialDesignContent,
        info: StyledMaterialDesignContent,
      }}
    >
      <SnackbarContext.Provider value={{ showSnackbar }}>
        {children}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={snackbar.autoHideDuration}
          onClose={handleClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          elevation={0}
          sx={{
            "& .MuiPaper-root": {
              padding: "8px",
              alignItems: "center",
            },
          }}
        >
          <Alert
            severity={snackbar.severity}
            action={
              snackbar.icon ? (
                <IconButton
                  aria-label="close"
                  color="inherit"
                  onClick={handleClose}
                  sx={{
                    "&.MuiIconButton-root": {
                      fontSize: "16px",
                      padding: "4px",
                      color: "var(--text3)",
                    },
                  }}
                >
                  {snackbar.icon === "close" ? (
                    <CloseIcon fontSize="small" />
                  ) : (
                    snackbar.icon
                  )}
                </IconButton>
              ) : null
            }
            sx={{
              "& .MuiAlert-action": {
                padding: "0px",
              },
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </SnackbarContext.Provider>
    </SnackbarProvider2>
  );
};
