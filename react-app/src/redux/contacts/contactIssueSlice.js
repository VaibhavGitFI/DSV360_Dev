import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";




// Thunk for fetching bag inoculation data
export const fetchContactIssues= createAsyncThunk(
    "issues/fetchClientIssue",
    async (orgId) => {
      try {
    
        const url =  `/server/time_entry_management_application_function/clientissue/${orgId}`;
        const response = await axios.get(url, {
          withCredentials: true, 
        });
        return response.data.data;
  
      } catch (error) {
        
        console.error(" Concacts issues Data Is Not Fetch Some Error Is occur:- ", error);
       
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of contacts  issues");
        }
        throw new Error(" Failed to fetch data of contacts  issues");
      }
    }
  );





export const ContactIssueSlice = createSlice({
  name: "ContactTasks",

  initialState: {
    isLoading: false,
    data: [],
    isError: false,
  },
  reducers: {
    addIssueData: (state, action) => {
     
      state.data.push(action.payload);

    },
    updateIssueData: (state, action) => {
      const updatedIssue = action.payload;
    
      const index = state.data.findIndex(client => client.ROWID === updatedIssue.ROWID);
    
      if (index !== -1) {
        state.data[index] = { ...state.data[index], ...updatedIssue };
       
      } else {
        console.warn("Client not found for update:", updatedIssue.ROWID);
      }
    },
    deleteIssueData: (state, action) => {
      const rowIdToDelete = action.payload;
     
      state.data = state.data.filter(client => client.ROWID !== rowIdToDelete);
     
    },
  
  },
  extraReducers: (builder) => {

    builder.addCase(fetchContactIssues.pending, (state) => {
      state.isLoading = true;
    }).addCase(fetchContactIssues.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
    }).addCase(fetchContactIssues.rejected, (state, action) => {
      console.log("Error", action.payload);
      state.isError = true;
    });

   


  },
});

export default ContactIssueSlice.reducer;
 export const  issuesActions  = ContactIssueSlice.actions;