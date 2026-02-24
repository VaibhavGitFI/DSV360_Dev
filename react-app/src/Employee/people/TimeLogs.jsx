import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  FormControl,
  CircularProgress,
  Autocomplete,
  TextField,
  Button,
  FormHelperText,
} from "@mui/material";
import axios from "axios";
import { useSelector } from "react-redux";

const TimeLogs = ({userid}) => {
// console.log(userid);

  const { data: employeesData } = useSelector((state) => state.employeeReducer);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const [teamMembers, setTeamMembers] = useState([]);
const [allUserIds, setAllUserIds] = useState([]);


useEffect(() => {
  const today = new Date().toISOString().split("T")[0];

  setStartDate(today);
  setEndDate(today);

  fetchTeamMembers(userid);
}, []);

useEffect(() => {
  if (allUserIds.length === 0) return;

  fetchAttendance("all", startDate, endDate);
}, [allUserIds]);



const fetchTeamMembers = async (userId) => {
  try {
    ; // logged-in manager id

    const res = await axios.get(
      "/server/time_entry_management_application_function/report/team",
      {
        params: { userId },
      }
    );



    const members = res.data?.data || [];

    setTeamMembers(members);
    setAllUserIds(members.map((m) => m.User_Id));
  } catch (error) {
    console.error("Error fetching team members", error);
  }
};


  function formatMinutesToHM(totalMinutes) {
  if (totalMinutes == null || isNaN(totalMinutes)) return "0m";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);

  if (hours > 0 && minutes > 0) return `${hours} h ${minutes} m`;
  if (hours > 0) return `${hours} h`;
  return `${minutes} m`;
}

 
 const fetchAttendance = async (employeeId = "", start = "", end = "") => {
  try {
    setLoading(true);
    // console.log(allUserIds)
    const userIds =
      employeeId === "all" ? allUserIds : employeeId ;

      // console.log("userId",userIds);

    const response = await axios.post(
      "/server/time_entry_management_application_function/attendance/dashboard",
      { UserID: userIds},{
        params: {
          Start_date: start,
          End_date: end,
          // ✅ array of userIds
        },
      }
    );

    setAttendanceData(response.data.data || []);
  } catch (error) {
    console.error("Error fetching attendance:", error);
  } finally {
    setLoading(false);
  }
};




  const allTeamMember = async(userid) =>{
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await axios.get(
        "/server/time_entry_management_application_function/report/team",
        { 
          params: { 
            userId: userid,
            
          } 
        }
      );
      //  console.log("response:", response);
       
    //    setallTeamMembers(response)
    //   setIsLogLoading(false);
      return response.data;
    } catch (error) {
      console.error("Error fetching attendance:", error);
      throw error;
    }
  }


 const handleFilterSubmit = async () => {
      if (!validateForm()) return;
    setIsSubmitting(true);
    
    await fetchAttendance(selectedEmployee, startDate, endDate);
    setIsSubmitting(false);
  };

  const getAttendanceStatus = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return <span style={{ color: "gray" }}>Incomplete</span>;

  const diffHours = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60);
  const statusColor = diffHours < 10 ? "red" : "green";
  const statusText = diffHours < 10 ? "Less than 10 hrs" : "OK";

  return (
    <span style={{ color: statusColor, fontWeight: "bold" }}>
      {statusText} ({diffHours.toFixed(1)} hrs)
    </span>
  );
};

  const validateForm = () => {
    const newErrors = {};

    if (!selectedEmployee) newErrors.employee = "Please select an employee.";
    if (!startDate) newErrors.startDate = "Start date is required.";
    if (!endDate) newErrors.endDate = "End date is required.";
    else if (new Date(endDate) < new Date(startDate))
      newErrors.endDate = "End date cannot be before start date.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: 4,
        p: 2,
      }}
    >
      <CardContent>
        {/* Header Section */}
<Box
  sx={{
    display: "flex",
    flexDirection: { xs: "column", sm: "row" },
    alignItems: { xs: "flex-start", sm: "center" },
    justifyContent: "space-between",
    gap: 2,
    mb: 2,
    pb: 1.5,
    borderBottom: "1px solid",
    borderColor: "divider",
  }}
>
  {/* Title */}
  <Box sx={{ minWidth: 0 }}>
    <Typography
      variant="h6"
      sx={{
        fontWeight: 900,
        color: "primary.main",
        lineHeight: 1.2,
      }}
    >
      Attendance Tracker
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
      Filter attendance by employee
    </Typography>
  </Box>

  {/* Employee Selector */}
  <Box
    sx={{
      width: { xs: "100%", sm: 360 },
      minWidth: { sm: 300 },
    }}
  >
    <FormControl fullWidth error={!!errors.employee}>
     <Autocomplete
  options={[
    { user_id: "all", label: "All Employees" },
    ...teamMembers.map((emp) => ({
      user_id: emp.User_Id,
      label: emp.Username,
    })),
  ]}
  getOptionLabel={(option) => option.label}
  isOptionEqualToValue={(option, value) =>
    option.user_id === value.user_id
  }
  value={
    selectedEmployee === "all"
      ? { user_id: "all", label: "All Employees" }
      : teamMembers.find((e) => e.user_id === selectedEmployee) || null
  }
  onChange={(e, val) => {
    setSelectedEmployee(val?.user_id || "");
    setErrors((prev) => ({ ...prev, employee: "" }));
  }}
  renderInput={(params) => (
    <TextField {...params} label="Select Employee" size="small" />
  )}
/>



      {errors.employee && <FormHelperText>{errors.employee}</FormHelperText>}
    </FormControl>
  </Box>
</Box>


       
        <Box
        display="flex"
        flexWrap="wrap"
        gap={2}
        mb={3}
        sx={{
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setErrors((prev) => ({ ...prev, startDate: "" }));
          }}
          InputLabelProps={{ shrink: true }}
          error={!!errors.startDate}
          helperText={errors.startDate}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setErrors((prev) => ({ ...prev, endDate: "" }));
          }}
          InputLabelProps={{ shrink: true }}
          error={!!errors.endDate}
          helperText={errors.endDate}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleFilterSubmit}
          disabled={isSubmitting}
          sx={{
            alignSelf: { xs: "stretch", sm: "center" },
            minWidth: { xs: "100%", sm: "120px" },
            textTransform: "none",
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Submit"
          )}
        </Button>
      </Box>

      
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={3}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>Name</b>
                  </TableCell>
                  <TableCell>
                    <b>Date</b>
                  </TableCell>
                  <TableCell>
                    <b>Check In</b>
                  </TableCell>
                   <TableCell>
                    <b>Check Out</b>
                  </TableCell>
                  <TableCell>
                    <b>Total Time</b>
                  </TableCell>
                   <TableCell>
                    <b>Status</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceData.length > 0 ? (
                  attendanceData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{row.Username || row.name}</TableCell>
                      <TableCell>{row.Day_Date || row.Day_Date}</TableCell>
                      <TableCell>
                        <Typography
                          
                        >
                          {new Date(row.Check_In).toLocaleTimeString("en-GB")}

                        </Typography>
                      </TableCell>
                       <TableCell>
                        <Typography
                          
                        >
                          {row.Check_Out===null?"Pending":new Date(row.Check_Out).toLocaleTimeString("en-GB")}

                        </Typography>
                      </TableCell>
                      <TableCell>{formatMinutesToHM(row.Total_Time)}</TableCell>
                        <TableCell>{getAttendanceStatus(row.Check_In, row.Check_Out)}</TableCell>

                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeLogs;
