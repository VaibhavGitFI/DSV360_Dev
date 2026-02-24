import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { EmployeeSlice } from "../Employee/EmployeeSlice";

export const fetchEmpProject = createAsyncThunk(
  "Project/fetchEmpProject",
  async () => {
    const user = JSON.parse(localStorage.getItem("currUser"));
    if (!user || !user.userid) {
      console.error("User ID not found!");
      return null;
    }
    try {
      const url = `/server/time_entry_management_application_function/projects/${user.userid}`;
      const response = await axios.get(url, { withCredentials: true });
      return response.data.data;  
    } catch (error) {
      console.error("Error in fetchEmpProject:", error);
      throw new Error("Failed to fetch data of Emp Project");
    }
  }
);

export const empProjectSlice = createSlice({
  name: "empProject",
  initialState: {
    isLoading: false,
    data: [],  // Default to null
    isError: false,
  },
  reducers: {
        updateEmpProject: (state, action) => {
     const updatedProject = action.payload;

  state.data = state.data.map((proj) =>
    proj.Projects.ROWID === updatedProject.ROWID
      ? { ...proj, Projects: { ...proj.Projects, ...updatedProject } }
      : proj
  );
},

  deleteEmpProject: (state, action) => {
    const rowIdToDelete = action.payload; 
    state.data = state.data.filter(
      (proj) => proj.Projects.ROWID !== rowIdToDelete
    );
  },

    addEmpProject: (state, action) => {
      const newProject = action.payload; 
      if (newProject && newProject.ROWID) {
    state.data = [{ Projects: newProject }, ...state.data];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmpProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEmpProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload || []; // Ensure array format
      })
      .addCase(fetchEmpProject.rejected, (state, action) => {
        console.log("fetchEmpProject rejected:", action.error);
        state.isError = true;
      });
  },
});

export default empProjectSlice.reducer;
 export const  EmpProjectActions  = empProjectSlice.actions;