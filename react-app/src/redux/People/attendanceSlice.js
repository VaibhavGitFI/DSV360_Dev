import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch user attendance status
export const fetchAttendance = createAsyncThunk(
  "attendance/fetchAttendance",
  async (userId) => {
    const res = await axios.get(`/server/time_entry_management_application_function/status/${userId}`);
    return res.data;

   
  }

);
// Check-in API
export const checkInUser = createAsyncThunk(
  "attendance/checkInUser",
  async ({ userId, name, lat, long }) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const payload = {
      User_ID: userId,
      Username: name,
      CIN_Location_Long: long,
      CIN_Location_Lat: lat,
      Day_Date: today,
      CIN_Device: "test-phone",
    };

    const res = await axios.post(
      "/server/time_entry_management_application_function/checkIn",
      payload
    );
    return res.data; 
  }
);

// Check-out API
export const checkOutUser = createAsyncThunk(
  "attendance/checkOutUser",
  async ({ rowId, lat, long, checkInTime }) => {
    const payload = {
      ROWID: rowId,
      COUT_Location_Lat: lat,
      COUT_Location_Long: long,
      COUT_Device: "test-phone",
      Check_In: checkInTime,
    };

    const res = await axios.put(
      "/server/time_entry_management_application_function/checkOut",
      payload
    );
    return res.data;
  }
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    isCheckIn: false,
    checkInTime: null,
    elapsedSeconds: 0,
    rowId: null,
    loading: false,
    error: null,
  },
  reducers: {
 tick: (state) => {
  if (state.isCheckIn && state.checkInTime) {
    state.elapsedSeconds = Math.floor(
      (Date.now() - state.checkInTime) / 1000
    );
  }
}
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendance.fulfilled, (state, action) => {
  state.isCheckIn = action.payload.isCheckIn;
  if (action.payload.Check_In) {
    const checkInStr = action.payload.Check_In.replace(" ", "T");
    state.checkInTime = new Date(checkInStr).getTime();

    state.elapsedSeconds = state.isCheckIn
      ? Math.floor((Date.now() - state.checkInTime) / 1000)
      : 0;
  } else {
    state.checkInTime = null;
    state.elapsedSeconds = 0;
  }

  state.rowId = action.payload.ROWID || null;
})

    .addCase(checkInUser.fulfilled, (state, action) => {
  state.isCheckIn = true;

  const checkInStr = action.payload.row.Check_In.replace(" ", "T"); 
  state.checkInTime = new Date(checkInStr).getTime(); 

  state.rowId = action.payload.row.ROWID;
  state.elapsedSeconds = 0;
}) 
.addCase(checkOutUser.fulfilled, (state, action) => {
        state.isCheckIn = false;
        state.isRunning = false;
        state.checkInTime = null;
        state.rowId = null;
        state.elapsedSeconds =0;
         
      });
      
  },
});

export const { tick } = attendanceSlice.actions;
export default attendanceSlice.reducer;
