import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";




// Thunk for fetching bag inoculation data
export const fetchContact= createAsyncThunk(
    "contact/fetchContact",
    async (orgId) => {
      try {
     
        const url =  "/server/time_entry_management_application_function/contact/" + orgId ;
        const response = await axios.get(url, {
          withCredentials: true, 
        });
          return response.data.data;
  
      } catch (error) {
        console.error(" contacts Task Data Is Not Fetch Some Error Is occur:- ", error);
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of contacts Tasks");
        }
        throw new Error(" Failed to fetch data of contacts  Tasks");
      }
    }
  );





export const ContactSlice = createSlice({
  name: "Contact",

  initialState: {
    isLoading: false,
    data: [],
    isError: false,
  },
  reducers: {
  
  },
  extraReducers: (builder) => {

    builder.addCase(fetchContact.pending, (state) => {
      state.isLoading = true;
    }).addCase(fetchContact.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
    }).addCase(fetchContact.rejected, (state, action) => {
      console.log("Error", action.payload);
      state.isError = true;
    });

   


  },
});

export default ContactSlice.reducer;