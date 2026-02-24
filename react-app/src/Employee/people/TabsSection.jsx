import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Divider,
  Button,
  useTheme,
} from "@mui/material";
import { useSelector } from "react-redux";
import CustomTabPanel from "./CustomTabPanel";
import ActivityTab from "./ActivityTab";
import LeaveTab from "./LeaveTab";
import AttendanceTab from "./AttendanceTab";
import HolidayCalendar from "../../Admin/People/HolidayCalendar"
import LeaveSummary from "../../Admin/People/LeaveSummary";
import LeaveRequests from "../../Admin/People/LeaveRequests";
import Attendance from "../../Admin/People/Attendance";
import TimeLogs from "./TimeLogs";
const TabsSection = ({ userData, workSchedule ,activityLogs,isLogLoading }) => {
  const theme = useTheme();

    const user = useSelector((state) => state.user.user);
    // console.log("userData",userData)
  
  
  const [value, setValue] = React.useState(0);
  const[currUser, setCurrUser] = useState(user);



  const handleChange = (e, newValue) => setValue(newValue);

  const attendanceData = [
  { day: "Sun", date: "05", shift: "General", shiftTime: "9:00 AM - 6:00 PM", status: "Weekend" },
  { day: "Mon", date: "06", shift: "General", shiftTime: "9:00 AM - 6:00 PM", status: "Pending", isToday: true },
  { day: "Tue", date: "07", shift: "General", shiftTime: "9:00 AM - 6:00 PM", status: "Present" },
  { day: "Wed", date: "08", shift: "General", shiftTime: "9:00 AM - 6:00 PM", status: "Present" },
  { day: "Thu", date: "09", shift: "General", shiftTime: "9:00 AM - 6:00 PM", status: "Present" },
];




  return (
    <Paper sx={{ borderRadius: 2, boxShadow: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, pt: 1 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Activities" />
          {/* <Tab label="Feeds" />
          <Tab label="Profile" />
          <Tab label="Approvals" /> */}
          <Tab label="Leave" />
         (<Tab label="Attendance" />)  
          <Tab label="Holiday Calender" />
           {user.roleId == "17682000000035348" && ( <Tab label="Leave Summary" /> )}
           {user.roleId == "17682000000035348" &&  ( <Tab label="Leave Request" />)}
            {user.roleId == "17682000000035348" &&  ( <Tab label="Team Attendance"/>)}
        </Tabs>
        <Box sx={{ position: "absolute", right: 20, top: 12 }}>
          <Divider orientation="vertical" flexItem sx={{ mr: 1, height: 24 }} />
          <Button size="small" sx={{ minWidth: 0, p: 0.5 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                width: "12px",
                height: "12px",
              }}
            >
              <Box sx={{ height: "1px", bgcolor: "text.secondary" }} />
              <Box sx={{ height: "1px", bgcolor: "text.secondary", width: "70%" }} />
              <Box sx={{ height: "1px", bgcolor: "text.secondary" }} />
            </Box>
          </Button>
        </Box>
      </Box>

      {/* Tabs Content */}
      <CustomTabPanel value={value} index={0}>
        <ActivityTab userData={userData} workSchedule={workSchedule}  activityLogs={activityLogs} isLogLoading={isLogLoading}/>
      </CustomTabPanel>
      {/* <CustomTabPanel value={value} index={1}>
        Feeds Content
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        Profile Content
      </CustomTabPanel> */}
        <CustomTabPanel value={value} index={1}>
        <LeaveTab userData={userData}/>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
  <AttendanceTab workSchedule={workSchedule}  userData={userData} />
</CustomTabPanel>
  <CustomTabPanel value={value} index={3}>
    <HolidayCalendar/>
</CustomTabPanel>

  <CustomTabPanel value={value} index={4}>
    <LeaveSummary userRole = "employee"/>
</CustomTabPanel>

 <CustomTabPanel value={value} index={5}>
    <LeaveRequests   url={`/server/time_entry_management_application_function/leave/approval/team/${currUser.userid}`}
/>
</CustomTabPanel>

 <CustomTabPanel value={value} index={6}>
    {/* <LeaveRequests   url={`/server/time_entry_management_application_function/leave/approval/team/${currUser.userid}`}/> */}
    {/* <Attendance url = {`/server/time_entry_management_application_function/attendance/dashboard/${currUser.userid}`}/> */}
    <TimeLogs userid= {userData.id}/>

</CustomTabPanel>


    </Paper>
  );
};

export default TabsSection;
