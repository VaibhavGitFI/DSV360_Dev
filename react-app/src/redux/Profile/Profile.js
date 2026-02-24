import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



export const fetchProfile = createAsyncThunk(
    "profile/fetchProfile",
    async () => {
        const user = JSON.parse(localStorage.getItem("currUser"));
      try {
        const url = `/server/time_entry_management_application_function/profile/data/${user.userid}`;
        const response = await axios.get(url, {
          withCredentials: true, 
        });
       
        return response.data.data.Users;
  
      } catch (error) {
       
        console.error("Profile Data Is Not Fetch Some Error Is occur:- ", error);
      
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of Profile");
        }
        throw new Error("Failed to fetch data of Profile");
      }
    }
  );


    export const ProfileSlice = createSlice({
      name: "Profile",
    
      initialState: {
        isLoading: false,
        data: null,
        isError: false,
      },
      reducers: {},
      extraReducers: (builder) => {
    
        builder.addCase(fetchProfile.pending, (state) => {
          state.isLoading = true;
        }).addCase(fetchProfile.fulfilled, (state, action) => {
          // console.log("Fetched Profile Data:", action.payload); 
          state.isLoading = false;
          state.data = action.payload;
        }).addCase(fetchProfile.rejected, (state, action) => {
          console.log("Error", action.payload);
          state.isError = true;
        });
      },
    });
  
    export default ProfileSlice.reducer;