import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



export const fetchEmpIssue = createAsyncThunk(
    "issue/fetchEmpIssue",
    async (userid) => {   
      try {
       const url = `/server/time_entry_management_application_function/assignissue/${userid}`
        const response = await axios.get(url, {
          withCredentials: true,
        });
       
       
       return response.data.data;
  
      } catch (error) {
      
        console.error(" Emp Issue Data Is Not Fetch Some Error Is occur:- ", error);
       
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of Emp Issue");
        }
        throw new Error("Failed to fetch data of Emp Issue");
      }
    }
  );


  export const EmpissueSlice = createSlice({
      name: "Issue",
    
      initialState: {
        isLoading: false,
        data: [],
        isError: false,
      },

      reducers: {
        updateIssue: (state, action) => {
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
    
        builder.addCase(fetchEmpIssue.pending, (state) => {
          state.isLoading = true;
        }).addCase(fetchEmpIssue.fulfilled, (state, action) => {
          state.isLoading = false;
          state.data = action.payload;
        }).addCase(fetchEmpIssue.rejected, (state, action) => {
          console.log("Error", action.payload);
          state.isError = true;
        });
      },
    });
  
    export default EmpissueSlice;

     export const  issuesActions  = EmpissueSlice.actions;
