import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



export const fetchIssueData = createAsyncThunk(
    "issue/fetchIssueData",
    async () => {
      
      try {
        const url = "/server/time_entry_management_application_function/issue";
      
        const response = await axios.get(url, {
          withCredentials: true, 
        });
        return response.data.data;
  
      } catch (error) {
       
        console.error("Issue Data Is Not Fetch Some Error Is occur:- ", error);
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of Issue");
        }
        throw new Error("Failed to fetch data of Issue");
      }
    }
  );


  export const issueSlice = createSlice({
      name: "Issue",
    
      initialState: {
        isLoading: false,
        data: [],
        isError: false,
      },

      reducers: {
        addissueData: (state, action) => {
          state.data.unshift(action.payload);
        },

        deleteissueData: (state, action) => {
          const rowIdToDelete = action.payload;
          state.data = state.data.filter(client => client.ROWID !== rowIdToDelete);
        },

        updateIssueData: (state, action) => {
          const updatedClient = action.payload;
          const index = state.data.findIndex(client => client.ROWID === updatedClient.ROWID);
        
          if (index !== -1) {
            state.data[index] = { ...state.data[index], ...updatedClient };
          } else {
            console.warn("Client not found for update:", updatedClient.ROWID);
          }
        },
      },
      extraReducers: (builder) => {
    
        builder.addCase(fetchIssueData.pending, (state) => {
          state.isLoading = true;
        }).addCase(fetchIssueData.fulfilled, (state, action) => {
          state.isLoading = false;
          state.data = action.payload;
        }).addCase(fetchIssueData.rejected, (state, action) => {
          console.log("Error", action.payload);
          state.isError = true;
        });
      },
    });
  
    export default issueSlice;

    export const  issuesActions  = issueSlice.actions;
