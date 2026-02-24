import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";




// Thunk for fetching bag inoculation data
export const fetchContactProject= createAsyncThunk(
    "projects/fetchClientProjects",
    async (orgId) => {
      try {
      
        const url = `/server/time_entry_management_application_function/clientProject/${orgId}`;
     
        const response = await axios.get(url, {
          withCredentials: true, 
        });
        
         
     
        return response.data.data;
  
      } catch (error) {
      
        console.error(" Concacts projects Data Is Not Fetch Some Error Is occur:- ", error);
       
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of contacts  projects");
        }
      
        throw new Error(" Failed to fetch data of contacts  projects");
      }
    }
  );





export const ContactProjectSlice = createSlice({
  name: "ContactProjects",

  initialState: {
    isLoading: false,
    data: [],
    isError: false,
  },
  reducers: {
  
  },
  extraReducers: (builder) => {

    builder.addCase(fetchContactProject.pending, (state) => {
      state.isLoading = true;
    }).addCase(fetchContactProject.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
    }).addCase(fetchContactProject.rejected, (state, action) => {
      console.log("Error", action.payload);
      state.isError = true;
    });

   


  },
});

export default ContactProjectSlice.reducer;