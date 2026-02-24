import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



export const fetchAdmin = createAsyncThunk(
    "admin/fetchAdmin",
    async (orgId) => {
      try {
      
        
        const url = `/server/time_entry_management_application_function/org/${orgId}`;
     
        const response = await axios.get(url, {
          withCredentials: true, 
        });
      
       
        return response.data.organization;
  
      } catch (error) {
      
        console.error("Time Entry  Data Is Not Fetch Some Error Is occur:- ", error);
        
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of Time Entry");
        }
       
        throw new Error("Failed to fetch data of Time Entry");
      }
    }
  );


  export const AdminSlice = createSlice({
      name: "Admin Data ",
    
      initialState: {
        isLoading: false,
        data: [],
        isError: false,
      },

      reducers: {
         updateAdminState: (state, action) => {
      // Ensure only one element in the array
      state.data = action.payload;
    },
      },
      extraReducers: (builder) => {
    
        builder.addCase(fetchAdmin.pending, (state) => {
          state.isLoading = true;
        }).addCase(fetchAdmin.fulfilled, (state, action) => {
          state.isLoading = false;
          state.data = action.payload;
        }).addCase(fetchAdmin.rejected, (state, action) => {
          console.log("Error", action.payload);
          state.isError = true;
        });
      },
    });
  export const { updateAdminState } = AdminSlice.actions;

    export default AdminSlice;

    // export const  clientActions  = clientSlice.actions;
