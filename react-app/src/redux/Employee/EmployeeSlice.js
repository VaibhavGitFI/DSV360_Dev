import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



export const fetchEmployees = createAsyncThunk(
    "employees/fetchEmployees",
    async () => {
      try {
        const url = '/server/time_entry_management_application_function/employee';
       
        const response = await axios.get(url, {
          withCredentials: true,
        });

         const filteredEmployees = response.data.users.filter(
        (emp) =>
          emp.role_details.role_name !== "Super Admin"  &&
          emp.role_details.role_name !== "Contacts"
      );
      return filteredEmployees;
      } catch (error) {
     
        console.error("Employee Data Is Not Fetch Some Error Is occur:- ", error);
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of Employee");
        }
        throw new Error("Failed to fetch data of Employee");
      }
    }
  );

  export const EmployeeSlice = createSlice({
    name: "employee",
  
    initialState: {
      isLoading: false,
      data: [],
      isError: false,
     
    },
    reducers: {
      addEmployeetData: (state, action) => {
        
        state.data.push(action.payload);
  
      },

      setEmployeeProfilePics: (state, action) => {
        const profileData = action.payload; 
       
   
        state.data = state.data.map((employee) => {
          const updated = profileData.find((p) => p.user_id === employee.user_id);
         return updated
      ? {
          ...employee,
          profile_pic: updated.profile_pic,
          phone: updated.phone,
          reporterId: updated.reporter_id,
          reporterName:updated.reporter_name,
          reporterProfile:updated.reporter_profile,
          team:updated.team,
          teamID:updated.team_id,
          EmpID:updated.emp_id,
          Shift_end_time:updated.shift_end_time,
          Shift_start_time:updated.shift_start_time,
          Location:updated.location,
        }
      : employee;
  });
      },    
      
      updateEmployeeReporter: (state, action) => {
  const { user_id, reporterId, reporterName, profile } = action.payload;

  const employee = state.data.find(
    (emp) => emp.user_id === user_id
  );

  if (employee) {
    employee.reporterId = reporterId;
    employee.reporterName = reporterName;
    employee.reporterProfile = profile;
  }
}
    },
    
    extraReducers: (builder) => {
  
      builder.addCase(fetchEmployees.pending, (state) => {
        state.isLoading = true;
      }).addCase(fetchEmployees.fulfilled, (state, action) => {
        state.isLoading = false;
        
        state.data = action.payload;
      }).addCase(fetchEmployees.rejected, (state, action) => {
        console.log("Error", action.payload);
        state.isError = true;
      });
    },
  });
  export const { setEmployeeProfilePics,updateEmployeeReporter } = EmployeeSlice.actions;
  export const {addEmployeetData} = EmployeeSlice.actions;
  export default EmployeeSlice.reducer;