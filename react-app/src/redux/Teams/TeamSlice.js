import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch all teams
export const fetchTeams = createAsyncThunk(
  "teams/fetchTeams",
  async () => {
    try {
      const url = '/server/time_entry_management_application_function/teams';
      const response = await axios.get(url, {
        withCredentials: true,
      });
      console.log("Teams response in store", response.data);
      return response.data.teams || response.data.data || [];
    } catch (error) {
      console.error("Teams Data Is Not Fetched, Error occurred:- ", error);
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to fetch teams data");
      }
      throw new Error("Failed to fetch teams data");
    }
  }
);

// Add new team
export const addTeam = createAsyncThunk(
  "teams/addTeam",
  async (teamData) => {
    try {
      const response = await axios.post(
        '/server/time_entry_management_application_function/teams',
        teamData,
        { withCredentials: true }
      );
      console.log("Add team response:", response.data);
      return response.data.team || response.data.data;
    } catch (error) {
      console.error("Error adding team:", error);
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to add team");
      }
      throw new Error("Failed to add team");
    }
  }
);

// Update team
export const updateTeam = createAsyncThunk(
  "teams/updateTeam",
  async ({ teamId, teamData }) => {
    try {
      const response = await axios.put(
        `/server/time_entry_management_application_function/teams/${teamId}`,
        teamData,
        { withCredentials: true }
      );
      console.log("Update team response:", response.data);
      return response.data.team || response.data.data;
    } catch (error) {
      console.error("Error updating team:", error);
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to update team");
      }
      throw new Error("Failed to update team");
    }
  }
);

// Delete team
export const deleteTeam = createAsyncThunk(
  "teams/deleteTeam",
  async (teamId) => {
    try {
      const response = await axios.delete(
        `/server/time_entry_management_application_function/teams/${teamId}`,
        { withCredentials: true }
      );
      console.log("Delete team response:", response.data);
      return teamId;
    } catch (error) {
      console.error("Error deleting team:", error);
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to delete team");
      }
      throw new Error("Failed to delete team");
    }
  }
);

// Add member to team
export const addTeamMember = createAsyncThunk(
  "teams/addTeamMember",
  async ({ teamId, employeeId }) => {
    try {
      const response = await axios.post(
        `/server/time_entry_management_application_function/teams/${teamId}/members`,
        { employeeId },
        { withCredentials: true }
      );
      console.log("Add team member response:", response.data);
      return { teamId, employeeId, data: response.data };
    } catch (error) {
      console.error("Error adding team member:", error);
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to add team member");
      }
      throw new Error("Failed to add team member");
    }
  }
);

// Remove member from team
export const removeTeamMember = createAsyncThunk(
  "teams/removeTeamMember",
  async ({ teamId, employeeId }) => {
    try {
      const response = await axios.delete(
        `/server/time_entry_management_application_function/teams/${teamId}/members/${employeeId}`,
        { withCredentials: true }
      );
      console.log("Remove team member response:", response.data);
      return { teamId, employeeId };
    } catch (error) {
      console.error("Error removing team member:", error);
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to remove team member");
      }
      throw new Error("Failed to remove team member");
    }
  }
);

export const TeamSlice = createSlice({
  name: "teams",

  initialState: {
    isLoading: false,
    data: [],
    isError: false,
    error: null,
  },

  reducers: {
    addTeamData: (state, action) => {
      state.data.push(action.payload);
    },
    updateTeamData: (state, action) => {
      const index = state.data.findIndex(team => team.ROWID === action.payload.ROWID);
      if (index !== -1) {
        state.data[index] = { ...state.data[index], ...action.payload };
      }
    },
    removeTeamData: (state, action) => {
      state.data = state.data.filter(team => team.ROWID !== action.payload);
    },
  },

  extraReducers: (builder) => {
    // Fetch teams
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.isError = false;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.error.message;
      })

    // Add team
      .addCase(addTeam.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addTeam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data.push(action.payload);
      })
      .addCase(addTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.error.message;
      })

    // Update team
      .addCase(updateTeam.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.data.findIndex(team => team.ROWID === action.payload.ROWID);
        if (index !== -1) {
          state.data[index] = { ...state.data[index], ...action.payload };
        }
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.error.message;
      })

    // Delete team
      .addCase(deleteTeam.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = state.data.filter(team => team.ROWID !== action.payload);
      })
      .addCase(deleteTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.error.message;
      })

    // Add team member
      .addCase(addTeamMember.fulfilled, (state, action) => {
        // Optionally update team member count or refresh teams
        console.log("Team member added successfully");
      })

    // Remove team member
      .addCase(removeTeamMember.fulfilled, (state, action) => {
        // Optionally update team member count or refresh teams
        console.log("Team member removed successfully");
      });
  },
});

export const { addTeamData, updateTeamData, removeTeamData } = TeamSlice.actions;
export default TeamSlice.reducer;

