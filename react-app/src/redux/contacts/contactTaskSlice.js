import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";




// Thunk for fetching bag inoculation data
export const fetchContactTask= createAsyncThunk(
    "task/fetchClientTask",
    async (orgId) => {
      try {
     
        const url = `/server/time_entry_management_application_function/contact/tasks/${orgId}`;
       
        const response = await axios.get(url, {
          withCredentials: true,
        });
        return response.data.data;
  
      } catch (error) {
       
        console.error(" Concacts Task Data Is Not Fetch Some Error Is occur:- ", error);
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of contacts Tasks");
        }
        throw new Error(" Failed to fetch data of contacts  Tasks");
      }
    }
  );





export const ContactTaskSlice = createSlice({
  name: "ContactProjects",

  initialState: {
    isLoading: false,
    data: [],
    isError: false,
  },
  reducers: {
  
  },
  extraReducers: (builder) => {

    builder.addCase(fetchContactTask.pending, (state) => {
      state.isLoading = true;
    }).addCase(fetchContactTask.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
    }).addCase(fetchContactTask.rejected, (state, action) => {
      console.log("Error", action.payload);
      state.isError = true;
    });

   


  },
});

export default ContactTaskSlice.reducer;