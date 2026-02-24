import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";




// Thunk for fetching bag inoculation data
export const fetchProjects = createAsyncThunk(
    "projects/fetchProjects",
    async () => {
      try {
        const url = '/server/time_entry_management_application_function/projects';
        const response = await axios.get(url, {
          withCredentials: true,
        });
        return response.data.data;
  
      } catch (error) {
        console.error("projects Data Is Not Fetch Some Error Is occur:- ", error);
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of projects");
        }
        throw new Error("Failed to fetch data of projects");
      }
    }
  );

export const addProject = createAsyncThunk(
    'projects/addProject',
    async (newProject, { rejectWithValue }) => {
      try {
        const currUser = JSON.parse(localStorage.getItem("currUser"));
        const response = await axios.post(
          "/server/time_entry_management_application_function/projects",
          {
            Project_Name: newProject.name,
            Description: newProject.description,
            Start_Date: newProject.startDate,
            End_Date: newProject.endDate,
            Status: newProject.status,
            Owner: newProject.owner,
            Owner_Id: newProject.ownerID,
            Assigned_To: newProject.assignedTo,
            Assigned_To_Id: newProject.assignedToID,
            Client_Name:newProject.client_name,
            Client_ID:newProject.clientID,
          }
        );
  
        const result = response.data;

        if (result.success) {
          return result.data; 
        } else {
          return rejectWithValue(result.message || 'Failed to add project');
        }
      } catch (error) {
        return rejectWithValue(error.message || 'Error adding project');
      }
    }
  );
  



export const ProjectSlice = createSlice({
  name: "projects",

  initialState: {
    isLoading: false,
    data: [],
    isError: false,
  },
  reducers: {
    addProjectData: (state, action) => {
      state.data.unshift(action.payload);

    },
    updateProjectData: (state, action) => {
      const updatedProject = action.payload;
      const index = state.data.findIndex(client => client.ROWID === updatedProject.ROWID);
    
      if (index !== -1) {
        state.data[index] = { ...state.data[index], ...updatedProject };
      } else {
        console.warn("Client not found for update:", updatedProject.ROWID);
      }
    },
    deleteProjecttData: (state, action) => {
      const rowIdToDelete = action.payload;
      state.data = state.data.filter(client => client.ROWID !== rowIdToDelete);
    },
  },
  extraReducers: (builder) => {

    builder.addCase(fetchProjects.pending, (state) => {
      state.isLoading = true;
    }).addCase(fetchProjects.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
    }).addCase(fetchProjects.rejected, (state, action) => {
      console.log("Error", action.payload);
      state.isError = true;
    });

    builder
    .addCase(addProject.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(addProject.fulfilled, (state, action) => {
      state.isLoading = false;
    })
    .addCase(addProject.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload;
    });


  },
});

export default ProjectSlice.reducer;
 export const  projectActions  = ProjectSlice.actions;