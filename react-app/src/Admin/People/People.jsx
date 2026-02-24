import React from "react";  
import { useState,useEffect } from "react";
import { Grid, Box, Typography,Paper,alpha,useTheme,TextField,Card } from "@mui/material";
import { Avatar } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";

import Attendance from "./Attendance";
import LeaveRequests from "./LeaveRequests";
import LeaveSummary from "./LeaveSummary";
import HolidayCalendar from "./HolidayCalendar";
import LeaveStats from "./LeaveStats";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ProfileCard from "../../Employee/people/ProfileCard";
import { UserDataActions } from "../.././redux/userData/userDataSlice";
import { useSelector,useDispatch } from "react-redux";
import {
  fetchAttendance,
  tick,
  checkInUser,
  checkOutUser,
} from "../../redux/People/attendanceSlice";
import axios from "axios";
import { fetchProfile } from "../../redux/Profile/Profile";

const People = () => {
  
    

    const theme = useTheme();
        const dispatch = useDispatch()
    const user = useSelector((state) => state.user.user); 
     const { isCheckIn, checkInTime, elapsedSeconds, rowId } = useSelector(
    (state) => state.attendance
  );

    const [sync, setSync] = useState(false);
    const [isLogLoading, setIsLogLoading] = useState(true);
    const [activityLogs, setActivityLogs] = useState([]);
    const [userLocation, setUserLocation] = useState(null);

     const userData = {
    id: user.userid,
    name: user.firstName + " " + user.lastName,
    avatarUrl: "/static/images/avatar/1.jpg",
    isCheckInPending: !isCheckIn, 
    shift: "General",
    shiftStartTime: "9:00 AM",
    shiftEndTime: "7:00 PM",
  };

 

    useEffect(() => {
      dispatch(fetchAttendance(userData.id));

    
    }, [dispatch, userData.id]);
  

   const verifyNetwork = async () =>{
    try{
        const res = await axios.get("https://api.ipify.org?format=json");

      if(res.ip === "27.107.69.106"){
        return true;
      }else{
        return false;
      }

    }catch(e){
      return false;
    }
   }

       useEffect(() => {
          let interval;
          if (isCheckIn) {
            interval = setInterval(() => {
              dispatch(tick());
            }, 1000);
          }
          return () => clearInterval(interval);
        }, [isCheckIn, dispatch]);


     const handleCheckIn = async () => {
        try {
          const res = await dispatch(
            checkInUser({
              userId: userData.id,
              name: userData.name,
              lat: userLocation?.latitude || "123",
              long: userLocation?.longitude || "123",
            })
          );
    
         
          if (res?.payload?.row) {
            setActivityLogs((prev) => [
              ...prev,
              {
                ROWID: res.payload.row.ROWID,
                Day_Date: res.payload.row.Day_Date,
                Username: res.payload.row.Username,
                Check_In: res.payload.row.Check_In,
                Check_Out: null,
                Total_Time: null,
              },
            ]);
          }
        } catch (err) {
          console.error("Check-in failed:", err);
        }
      };
    
      const handleCheckOut = async () => {
        try {
          const res = await dispatch(
            checkOutUser({
              rowId,
              lat: userLocation?.latitude || "123",
              long: userLocation?.longitude || "123",
              checkInTime,
            })
          );
    
          if (res?.payload?.row) {
            setActivityLogs((prev) =>
              prev.map((log) =>
                log.ROWID === res.payload.row.ROWID
                  ? {
                      ...log,
                      Check_Out: res.payload.row.Check_Out,
                      Total_Time: res.payload.row.Total_Time,
                    }
                  : log
              )
            );
          }
        } catch (err) {
          console.error("Check-out failed:", err);
        }
      };
  
  
  
  return (
    <Box sx={{ p: 3, bgcolor: "background.default", minHeight: "100vh" }}>
         <Paper
              elevation={0}
              sx={{
                mb: 4,
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(
                  theme.palette.primary.main,
                  0.08
                )} 0%, ${alpha(theme.palette.primary.light, 0.15)} 100%)`,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
             
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  width: { xs: "100%", md: "auto" },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    width: 50,
                    height: 50,
                  }}
                >
                  <ManageAccountsIcon sx={{ color: "#fff" }} fontSize="large" />
                </Avatar>
      
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    fontSize: { xs: "1.5rem", sm: "2rem" },
                  }}
                >
                  People Management
                </Typography>
              </Box>
      
            </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>

<ProfileCard  userData={userData}
            sync={sync}
            setSync={setSync}
            onCheckOut={handleCheckOut}
            onCheckIn={handleCheckIn}
            elapsedSeconds={elapsedSeconds}/>
        </Grid>

        

        <Grid size={{ xs: 12, md: 8 }}>
           <Card sx={{ borderRadius: 4, boxShadow: 3, p: 1 }}>
          <LeaveRequests url={"/server/time_entry_management_application_function/leave/approval"} />
          </Card>
        </Grid>

        <Grid size={12}>
          <LeaveStats/>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
            {/* <Card sx={{ borderRadius: 4, boxShadow: 3 }}> */}
           <LeaveSummary userRole = "Admin" />
           {/* </Card> */}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
              {/* <Card sx={{ borderRadius: 4, boxShadow: 3, p: 0, height: "100%" }}> */}
          <HolidayCalendar />
           {/* </Card> */}
        </Grid>



        <Grid size={12}>

           <Attendance  />
        </Grid>
      </Grid>
    </Box>
  );
};

export default People;

