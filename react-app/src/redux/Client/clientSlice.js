import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



export const fetchClientData = createAsyncThunk(
    "client/fetchClientData",
    async () => {
      try {
        const url = "/server/time_entry_management_application_function/clientOrg";
        const response = await axios.get(url, {
          withCredentials: true, 
        });
        return response.data.data;
  
      } catch (error) { 
        console.error("Client Data Is Not Fetch Some Error Is occur:- ", error);
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of Client");
        }
        throw new Error("Failed to fetch data of Client");
      }
    }
  );


  export const clientSlice = createSlice({
      name: "Client",
    
      initialState: {
        isLoading: false,
        data: [],
        isError: false,
      },

      reducers: {
        addClientData: (state, action) => {
          state.isLoading = true
          state.data.unshift(action.payload);
         },
        updateClientData: (state, action) => {
          const updatedClient = action.payload;
          const index = state.data.findIndex(client => client.ROWID === updatedClient.ROWID);
        
          if (index !== -1) {
            state.data[index] = { ...state.data[index], ...updatedClient };
          } else {
            console.warn("Client not found for update:", updatedClient.ROWID);
          }
        },
        deleteClientData: (state, action) => {
          const rowIdToDelete = action.payload;
          state.data = state.data.filter(client => client.ROWID !== rowIdToDelete);
        },

      },
      extraReducers: (builder) => {
    
        builder.addCase(fetchClientData.pending, (state) => {
          state.isLoading = true;
        }).addCase(fetchClientData.fulfilled, (state, action) => {
          state.isLoading = false;
          state.data = action.payload;
        }).addCase(fetchClientData.rejected, (state, action) => {
          console.log("Error", action.payload);
          state.isError = true;
        });
      },
    });
  
    export default clientSlice;

    export const  clientActions  = clientSlice.actions;
