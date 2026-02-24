import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



export const fetchFeedback = createAsyncThunk(
    "feedback/fetchFeedback",
    async () => {
      
      try {
        const url = "/server/time_entry_management_application_function/feedback";
      
        const response = await axios.get(url, {
          withCredentials: true, 
        });
       
        return response.data.data;
  
      } catch (error) {
        console.error("Feedback Data Is Not Fetch Some Error Is occur:- ", error);
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of Feedback");
        }
        throw new Error("Failed to fetch data of Feedback");
      }
    }
  );


  export const FeedbackSlice = createSlice({
      name: "Feedback",
    
      initialState: {
        isLoading: false,
        data: [],
        isError: false,
      },
      reducers: {},
      extraReducers: (builder) => {
    
        builder.addCase(fetchFeedback.pending, (state) => {
          state.isLoading = true;
        }).addCase(fetchFeedback.fulfilled, (state, action) => {
          state.isLoading = false;
          state.data = action.payload;
        }).addCase(fetchFeedback.rejected, (state, action) => {
          console.log("Error", action.payload);
          state.isError = true;
        });
      },
    });
  
    export default FeedbackSlice.reducer;