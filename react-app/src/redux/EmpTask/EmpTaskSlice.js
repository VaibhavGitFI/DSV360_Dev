import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchEmpTask = createAsyncThunk(
    "Task/fetchEmpTask",
    async () => {
      const user = JSON.parse(localStorage.getItem("currUser"));

      const userid = user.userid;
      try {
        const url =  `/server/time_entry_management_application_function/tasks/employee/${userid}`;
      
        const response = await axios.get(url, {
          withCredentials: true, 
        });
        return response.data.data;

  
      } catch (error) {
        console.error("Emp Task  Data Is Not Fetch Some Error Is occur:- ", error);
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of Emp Task");
        }
        throw new Error("Failed to fetch data of Emp Task");
      }
    }
  );

  export const EmpTaskSlice = createSlice({
        name: "EmpTask",
      
        initialState: {
          isLoading: false,
          data: [],
          isError: false,
        },
        reducers: {
             addEmpTaskLocal: (state, action) => {
    const task = action.payload;
    // normalize keys
    const normalizedTask = {
      ...task,
      Project_ID: task.Project_ID || task.ProjectID,
    };
    state.data.unshift(normalizedTask); // 👈 adds at the start instead of end
  }, // add new task locally
    
        },
        extraReducers: (builder) => {
      
          builder.addCase(fetchEmpTask.pending, (state) => {
            state.isLoading = true;
          }).addCase(fetchEmpTask.fulfilled, (state, action) => {
            state.isLoading = false;
            state.data = action.payload;
          }).addCase(fetchEmpTask.rejected, (state, action) => {
            console.log("Error", action.payload);
            state.isError = true;
          });
        },
      });
    
      export const { addEmpTaskLocal } = EmpTaskSlice.actions;

      export default EmpTaskSlice.reducer;