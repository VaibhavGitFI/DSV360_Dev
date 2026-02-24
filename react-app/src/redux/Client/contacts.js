import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



export const fetchClientContact = createAsyncThunk(
    "ClientContact/fetchClientContact",
    async () => {
      
      try { 
        const url = "/server/time_entry_management_application_function/contact";
      
        const response = await axios.get(url, {
          withCredentials: true,
        });
  
        return response.data.data;
  
      } catch (error) {
  
        console.error("Client contact  Data Is Not Fetch Some Error Is occur:- ", error);
      
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of Client contact");
        }
       
        throw new Error("Failed to fetch data of Client Contact");
      }
    }
  );


  export const clientContactSlice = createSlice({
      name: "ClientContact",
    
      initialState: {
        isLoading: false,
        data: [],
        isError: false,
      },

      reducers: {
        addClientStaffData: (state, action) => {
               state.data.unshift(action.payload);
    
        },
        setFilteredClientContact: (state, action) => {
          state.data = action.payload;
        },
        updateClientContactStatusLocally: (state, action) => {
          const { userID, status } = action.payload;
          const contactIndex = state.data.findIndex(contact => contact.UserID === userID);
          if (contactIndex !== -1) {
            state.data[contactIndex].status = status;
          }
        },
        deleteClienttData: (state, action) => {
          const rowIdToDelete = action.payload;
          state.data = state.data.filter(client => client.ROWID !== rowIdToDelete); 
        },      
      },


      extraReducers: (builder) => {
    
        builder.addCase(fetchClientContact.pending, (state) => {
          state.isLoading = true;
        }).addCase(fetchClientContact.fulfilled, (state, action) => {
          state.isLoading = false;
          state.data = action.payload;
        }).addCase(fetchClientContact.rejected, (state, action) => {
          console.log("Error", action.payload);
          state.isError = true;
        });
      },
    });
  
    export const clientContactActions = clientContactSlice.actions;
    export const { setFilteredClientContact } = clientContactSlice.actions;
    export const { updateClientContactStatusLocally } = clientContactSlice.actions;
export default clientContactSlice;
