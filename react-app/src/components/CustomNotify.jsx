import React from "react";
import { Snackbar, Alert, Slide } from "@mui/material";

const SlideTransition = (props) => <Slide {...props} direction="down" />;

const CustomNotify = ({
  open,
  message,
  severity = "success",
  duration = 3000,
  onClose,
  position = { vertical: "top", horizontal: "center" },
}) => {
  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    onClose?.();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={position}
      TransitionComponent={SlideTransition}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomNotify;
