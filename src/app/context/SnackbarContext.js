"use client";
import React, { createContext, useContext, useCallback } from "react";
import {
  SnackbarProvider as NotistackProvider,
  useSnackbar as useNotistack,
  MaterialDesignContent,
} from "notistack";
import { CircularProgress, styled, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

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

const InnerSnackbarProvider = ({ children }) => {
  const { enqueueSnackbar, closeSnackbar } = useNotistack();

  const showSnackbar = useCallback(
    (message, severity, icon = null, autoHideDuration = 3000) => {
      const action = (key) => (
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={() => closeSnackbar(key)}
          sx={{
            "&.MuiIconButton-root": {
              fontSize: "16px",
              padding: "4px",
              color: "var(--white)",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      );

      enqueueSnackbar(message, {
        variant: severity || "default",
        autoHideDuration: parseInt(autoHideDuration) || 3000,
        action: icon === "close" || !icon ? action : undefined,
      });
    },
    [enqueueSnackbar, closeSnackbar]
  );

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
    </SnackbarContext.Provider>
  );
};

export const SnackbarProvider = ({ children }) => {
  return (
    <NotistackProvider
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
      <InnerSnackbarProvider>{children}</InnerSnackbarProvider>
    </NotistackProvider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);
