import React from "react";
import { useState, useEffect } from "react";
import { Box, Grid, useTheme,Card,Avatar,Typography } from "@mui/material";

import ProfileCard from "./ProfileCard";
import TabsSection from "./TabsSection";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAttendance,
  tick,
  checkInUser,
  checkOutUser,
} from "../../redux/People/attendanceSlice";
import { UserDataActions } from "../../redux/userData/userDataSlice";
import axios from "axios";
import { fetchProfile } from "../../redux/Profile/Profile";
// --- Mock Data ---

const People = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { isCheckIn, checkInTime, elapsedSeconds, rowId } = useSelector(
    (state) => state.attendance
  );

  const user = useSelector((state) => state.user.user); // <-- access 'user' key
  const {data :profile} = useSelector((state)=> state.profileReducer);
  // console.log("profile",profile)

  //  useEffect(()=>{
  //   dispatch(fetchProfile());;
  //  },[dispatch]) 

  const getWorkSchedule = () => {
    const today = new Date();
    // Find the Sunday of the current week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday

    // Days mapping
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const schedule = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);

      currentDate.setDate(startOfWeek.getDate() + i);

      let status = "Normal";
      if (i === 0) status = "Weekend"; // Sunday
      if (i === 6) status = "Weekend"; // Saturday
      if (currentDate.toDateString() === today.toDateString()) {
        status = "Today";
      }

      schedule.push({
        day: days[i],
        date: currentDate.getDate(),
        status,
      });
    }

    return schedule;
  };

  const [sync, setSync] = useState(false);
  const [workSchedule, setWorkSchedule] = useState(getWorkSchedule());
  const [isLogLoading, setIsLogLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState([]);
  const [allTeamMembers, setallTeamMembers] = useState();


  useEffect(() => {
    const interval = setInterval(
      () => {
        setWorkSchedule(getWorkSchedule());
      },
      60 * 60 * 1000
    ); // check every hour
    return () => clearInterval(interval);
  }, []);

  const userData = {
    id: user.userid,
    name: user.firstName + " " + user.lastName,
    avatarUrl: "/static/images/avatar/1.jpg",
    isCheckInPending: !isCheckIn, // derive directly from Redux
    shift: "General",
    shiftStartTime: "9:00 AM",
    shiftEndTime: "7:00 PM",
  };

  const getAttendanceUserData = async (userid) => {
    try {
      const response = await axios.get(
        "/server/time_entry_management_application_function/attendance/user",
        {
          params: {
            UserID: userid,
          },
        }
      );

      // console.log("response:", response);
      return response.data;
    } catch (error) {
      console.error("Error fetching attendance:", error);
      throw error;
    }
  };

  const getAttendanceData = async (userid) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await axios.post(
        "/server/time_entry_management_application_function/attendance/dashboard",{UserID: userid},
        { 
          params: { 
            
            Start_date: today,
            End_date: today
          } 
        }
      );
      //  console.log("response:", response);
      setActivityLogs(response.data?.data || []);
      setIsLogLoading(false);
      return response.data;
    } catch (error) {
      console.error("Error fetching attendance:", error);
      throw error;
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
            // Start_date: today,
            // End_date: today
          } 
        }
      );
      //  console.log("response:", response);
       
       setallTeamMembers(response)
      setIsLogLoading(false);
      return response.data;
    } catch (error) {
      console.error("Error fetching attendance:", error);
      throw error;
    }
  }

  useEffect(() => {
    dispatch(fetchAttendance(userData.id));
     dispatch(fetchProfile());;
    getAttendanceData(userData.id);
    allTeamMember(userData.id)
  }, [dispatch, userData.id]);

  // Timer tick every second if checked in
  useEffect(() => {
    let interval;
    if (isCheckIn) {
      interval = setInterval(() => {
        dispatch(tick());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckIn, dispatch]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          setUserLocation({ latitude, longitude });
        },
        (error) => console.error("Error getting user location:", error)
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const [userLocation, setUserLocation] = useState(null);

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

      // Assuming res.payload.row contains your check-in response
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

      // If successful, patch the existing record
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

  // define the function that finds the users geolocation
  const getUserLocation = () => {
    // if geolocation is supported by the users browser
    if (navigator.geolocation) {
      // get the current users location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // save the geolocation coordinates in two variables
          const { latitude, longitude } = position.coords;
          // update the value of userlocation variable
          setUserLocation({ latitude, longitude });
        },
        // if there was an error getting the users location
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
    // if geolocation is not supported by the users browser
    else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
    <Grid container spacing={3}>
  {/* Left Sidebar */}
  <Grid size={{ xs: 12, md: 3 }} alignSelf="flex-start">
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* Top – 75% */}
      <Box sx={{ flex: 3 }}>
        <ProfileCard
          userData={userData}
          sync={sync}
          setSync={setSync}
          onCheckOut={handleCheckOut}
          onCheckIn={handleCheckIn}
          elapsedSeconds={elapsedSeconds}
        />
      </Box>

      {/* Bottom – 25% */}
      <Box sx={{ flex: 1 }}>
        <Card
      sx={{
        p: 2,
        height: "100%",
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        boxShadow: "0px 2px 10px rgba(0,0,0,0.06)",
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar
          src={profile?.ReporterImage}
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
          }}
        />

        <Box>
          <Typography variant="body2" color="text.secondary">
            Reporting To
          </Typography>

          <Typography fontWeight={700}>
            {/* {userData?.managerId || "1068"} –{" "} */}
            {profile?.ReporterName || "Not Assigned"}
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "#16a34a", fontWeight: 600 }}
          >
            In
          </Typography>
        </Box>
      </Box>
    </Card>
      </Box>
    </Box>
  </Grid>

  {/* Right Section */}
  <Grid size={{ xs: 12, md: 9 }}>
    <TabsSection
      userData={userData}
      workSchedule={workSchedule}
      sync={sync}
      activityLogs={activityLogs}
      setActivityLogs={setActivityLogs}
  
      isLogLoading={isLogLoading}
    />
  </Grid>
</Grid>


    </Box>
  );
};

export default People;
