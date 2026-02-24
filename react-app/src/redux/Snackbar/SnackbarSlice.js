// redux/Snackbar/SnackbarSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  openSnackbar: false,
  message: "",
  loading: false,
  action: null,
};

const snackbarSlice = createSlice({
  name: "snackbar",
  initialState,
  reducers: {
    showSnackbar: (state, action) => {
    
      state.openSnackbar = true;
      state.message = action.payload.message || "";
      state.loading = action.payload.loading || false;
      state.action = action.payload.action || null;
    },
    hideSnackbar: (state, xyz) => {
      state.openSnackbar = false;
      state.message = "";
      state.loading = false;
      state.action = null;
    },
  },
});

export const { showSnackbar, hideSnackbar } = snackbarSlice.actions;
export default snackbarSlice.reducer;
