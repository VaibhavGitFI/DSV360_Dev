import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



export const fetchTimeEntry = createAsyncThunk(
    "timeEntry/fetchTimeEntry",
    async (ROWID) => {
      
      try {
        
        const url = `/server/time_entry_management_application_function/timeentry/${ROWID}`;
        const response = await axios.get(url, {
          withCredentials: true, 
        });
        return response.data.data;
  
      } catch (error) {
        console.error("Time Entry  Data Is Not Fetch Some Error Is occur:- ", error);
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of Time Entry");
        }
        throw new Error("Failed to fetch data of Time Entry");
      }
    }
  );


  export const timeEntrySlice = createSlice({
      name: "Time Entry",
    
      initialState: {
        isLoading: false,
        data: [],
        isError: false,
      },

      reducers: {
        
      },
      extraReducers: (builder) => {
    
        builder.addCase(fetchTimeEntry.pending, (state) => {
          state.isLoading = true;
        }).addCase(fetchTimeEntry.fulfilled, (state, action) => {
          state.isLoading = false;
          state.data = action.payload;
        }).addCase(fetchTimeEntry.rejected, (state, action) => {
          console.log("Error", action.payload);
          state.isError = true;
        });
      },
    });
  
    export default timeEntrySlice;
