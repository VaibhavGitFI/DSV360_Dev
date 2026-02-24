import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



export const fetchTasks = createAsyncThunk(
    "tasks/fetchTasks",
    async () => {
   
      try {
        const url = '/server/time_entry_management_application_function/tasks';
        // Use axios.get instead of fetch
        const response = await axios.get(url, {
          withCredentials: true, 
        });
        return response.data.data;
  
      } catch (error) {
        console.error("Task Data Is Not Fetch Some Error Is occur:- ", error);
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of Tasks");
        }
        throw new Error("Failed to fetch data of Tasks");
      }
    }
  );

  export const TaskSlice = createSlice({
    name: "Tasks",
  
    initialState: {
      isLoading: false,
      data: [],
      isError: false,
    },
    reducers: {
      addTaskData: (state, action) => {
        state.data.unshift(action.payload);
  
      },

      updateTaskData: (state, action) => {
        const updatedTask = action.payload;
        const index = state.data.findIndex(client => client.ROWID === updatedTask.ROWID);
        if (index !== -1) {
          state.data[index] = { ...state.data[index], ...updatedTask };
         
        } else {
          
        }


      },

      deleteTasktData: (state, action) => {
        const rowIdToDelete = action.payload;
      
        state.data = state.data.filter(client => client.ROWID !== rowIdToDelete);
      },

    },
    extraReducers: (builder) => {
  
      builder.addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
      }).addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      }).addCase(fetchTasks.rejected, (state, action) => {
        console.log("Error", action.payload);
        state.isError = true;
      });
    },
  });

  export default TaskSlice.reducer;
   export const  TaskActions  = TaskSlice.actions;
