import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// -------------------------
// Fetch Running Timer
// -------------------------
export const fetchRunningTimer = createAsyncThunk(
  "timer/fetchRunningTimer",
  async ({ userId, taskId }) => {
    const res = await axios.get(
      "/server/time_entry_management_application_function/timeentry/timer",
      { params: { User_ID: userId, ...(taskId && { Task_ID: taskId }) } }
    );
    return res.data;
  }
);

// -------------------------
// Start Timer
// -------------------------
export const startTimer = createAsyncThunk(
  "timer/startTimer",
  async (payload) => {
    const res = await axios.post(
      "/server/time_entry_management_application_function/timeentry/timer/start",
      payload
    );
    return res.data;
  }
);

// -------------------------
// Stop Timer
// -------------------------
// export const stopTimer = createAsyncThunk(
//   "timer/stopTimer",
//   async ({ ROWID, Note, Type }) => {
//     const res = await axios.post(
//       "/server/time_entry_management_application_function/timeentry/timer/end",
//       { ROWID, Note, Type }
//     );
//     return res.data;
//   }
// );

export const stopTimer = createAsyncThunk(
  "timer/stopTimer",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post("/server/time_entry_management_application_function/timeentry/timer/end", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to stop timer"
      );
    }
  }
);
const initialState = {
  isRunning: false,
  timerId: null,
  taskId: null,
  taskName: null,
  startTime: null, // timestamp in ms
  elapsedSeconds: 0,
  loading: false,
};

const timerSlice = createSlice({
  name: "timer",
  initialState,
  reducers: {
    tickTimer: (state) => {
      if (state.isRunning && state.startTime) {
        const now = Date.now();
        state.elapsedSeconds = Math.max(
          0,
          Math.floor((now - state.startTime) / 1000)
        );
      }
    },
    resetTimer: (state) => Object.assign(state, initialState),
  },
  extraReducers: (builder) => {
    builder
      // -------------------------
      // Running Timer
      // -------------------------
      .addCase(fetchRunningTimer.fulfilled, (state, action) => {
        const payload = action.payload;
        if (payload.message === "Timer is Running" && payload.startTime) {
          let startTime = payload.startTime;

          // convert string to timestamp safely
          if (typeof startTime === "string") {
            startTime = new Date(startTime.replace(" ", "T")).getTime();
          }

          state.isRunning = true;
          state.timerId = payload.TimerId;
          state.taskId = payload.Task_ID;
          state.taskName = payload.Task_Name;
          state.startTime = startTime;
          state.elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        } else {
          Object.assign(state, initialState);
        }
      })

      // -------------------------
      // Start Timer
      // -------------------------
      .addCase(startTimer.fulfilled, (state, action) => {
        const data = action.payload.data;
        if (!data || !data.Start_time) return;

        let startTime = data.Start_time;
        if (typeof startTime === "string") {
          startTime = new Date(startTime.replace(" ", "T")).getTime();
        }

        state.isRunning = true;
        state.timerId = data.ROWID;
        state.taskId = data.Task_ID; // match backend Task_ID
        state.taskName = data.Task_Name;
        state.startTime = startTime;
        state.elapsedSeconds = 0;
      })

      // -------------------------
      // Stop Timer
      // -------------------------
       .addCase(stopTimer.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(stopTimer.fulfilled, state => {
        state.loading = false;
        Object.assign(state, initialState);

      })
      .addCase(stopTimer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  
  },
});

export const { tickTimer, resetTimer } = timerSlice.actions;
export default timerSlice.reducer;
