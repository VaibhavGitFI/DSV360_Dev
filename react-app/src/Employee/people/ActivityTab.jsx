import React, { useState, useEffect } from "react";
import { Box, Card, Grid, Typography, Divider, Avatar, alpha, CircularProgress ,keyframes,Chip} from "@mui/material";
import { LightModeOutlined, DarkModeOutlined, WbSunnyOutlined, NightsStayOutlined, Brightness3Outlined, AccessTimeOutlined } from '@mui/icons-material';
import AlarmOnIcon from "@mui/icons-material/AlarmOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import wavyHand from "../../../public/wavyHand.png"

const waveHello = keyframes`
  0%   { transform: rotate(0deg); }
  10%  { transform: rotate(14deg); }
  20%  { transform: rotate(-8deg); }
  30%  { transform: rotate(14deg); }
  40%  { transform: rotate(-4deg); }
  50%  { transform: rotate(10deg); }
  60%  { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
`;



const ActivityTab = ({ userData, workSchedule, activityLogs,isLogLoading }) => { 
  // --- Time Log State Management ---
  const processedData = { logs: activityLogs };
  const logsExist = processedData.logs.length > 0;
  
  const renderScheduleDay = (day) => (
    <Box
      key={day.date}
      sx={{
        textAlign: "center",
        p: 1,
        borderRadius: 1,
        borderBottom: day.status === "Today" ? "3px solid #1976d2" : "none",
      }}
    >
      <Typography variant="caption">{day.day}</Typography>
      <Typography variant="subtitle1" fontWeight={day.status === "Today" ? "bold" : "regular"}>
        {day.date}
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: day.status === "Absent" ? "error.main" : "text.secondary" }}
      >
        {day.status !== "Normal" && day.status}
      </Typography>
    </Box>
  );

  const dayToDate = (day) => {
    const d = Number(day);
    const now = new Date();
    // Use the actual current year and month
    return new Date(now.getFullYear(), now.getMonth(), d); 
  };

  const formatDate = (val) => {
    const dateObj = dayToDate(val);
    return dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getGreetingTime = () => {
  const hour = new Date().getHours();
  let timeOfDay = 'day'; // Default

  if (hour >= 5 && hour < 12) {
    timeOfDay = 'morning';
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon';
  } else if (hour >= 17 && hour < 21) {
    timeOfDay = 'evening';
  } else {
    timeOfDay = 'night';
  }
  return timeOfDay;
};


const getShiftMessage = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 6 = Sat
   const hour = now.getHours();
  const date = now.getDate(); // today's date (1–31)

  // --- Calculate Saturday number in month (NO LOOP) ---
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  
  // Offset to first Saturday
  const offsetToFirstSat = (6 - firstDay + 7) % 7;

  let saturdayCount = 0;

  if (day === 6) {
    // Saturday index formula
    saturdayCount = Math.floor((date - offsetToFirstSat - 1) / 7) + 1;
  }


  const isSunday = day === 0;
  const isSaturday = day === 6;
  const isFifthSaturday = isSaturday && saturdayCount === 5;

  // Weekend/weekday logic
  let isWorkingDay = false;

  if (isSunday) {
    isWorkingDay = false;
  } else if (isSaturday) {
    isWorkingDay = isFifthSaturday; // Only 5th Saturday is working day
  } else {
    isWorkingDay = true; // Mon–Fri
  }

   if (hour >= 19 && isWorkingDay) {
    return "Your shift is completed";
  }

  const inShiftTime = hour >= 9 && hour < 19;

  if (isWorkingDay && inShiftTime) {
    return "Your shift has already started";
  }

  return "Your shift has not being started";
};

const getTimeIcon = (timeOfDay) => {
  switch (timeOfDay) {
    case 'Morning':
      return <WbSunnyOutlined sx={{ fontSize: 36, color: "#ffc107" }} />; // Yellow sun
    case 'Afternoon':
      return <LightModeOutlined sx={{ fontSize: 36, color: "#ff9800" }} />; // Orange sun
    case 'Evening':
      return <Brightness3Outlined sx={{ fontSize: 36, color: "#ffb74d" }} />; // Warm moon/dusk
    case 'Night':
      return <NightsStayOutlined sx={{ fontSize: 36, color: "#7986cb" }} />; // Cool blue moon
    default:
      return <AccessTimeOutlined sx={{ fontSize: 36, color: "text.secondary" }} />; // Generic clock
  }
};

const hoverAnimation = keyframes`
  0% { transform: translateY(0); box-shadow: 0 4px 8px ${alpha('#000', 0.1)}; }
  100% { transform: translateY(-2px); box-shadow: 0 6px 12px ${alpha('#000', 0.2)}; }
`;

const timeOfDay = getGreetingTime();


  return (
    <Box>
      {/* Greeting Card (Unchanged) */}
      <Card
  sx={{
    display: "flex",
    p: 3, // Increased padding
    mb: 2,
    alignItems: 'center',
    borderRadius: 2, // Rounded corners
    bgcolor: alpha("#4caf50", 0.1), // Slightly deeper background
    borderLeft: `5px solid ${timeOfDay === 'night' ? '#7986cb' : '#1976d2'}`, // Border color changes
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      animation: `${hoverAnimation} 0.3s forwards`,

    },
  }}
>
 <Avatar
  sx={{
    width: 60,
    height: 60,
    mr: 2,
    boxShadow: "0 0 5px rgba(0,0,0,0.2)",
    bgcolor: alpha(timeOfDay === "night" ? "#7986cb" : "#1976d2", 0.12),
    border: `1px solid ${alpha(timeOfDay === "night" ? "#7986cb" : "#1976d2", 0.35)}`,
  }}
>
  <Box
    component="img"
    src={wavyHand}
    alt="Hello"
    sx={{
      width: 40,
      height: 40,
      objectFit: "contain",
      transformOrigin: "70% 70%", // wrist pivot
      animation: `${waveHello} 1.6s ease-in-out infinite`,
      filter: timeOfDay === "night" ? "brightness(1.05)" : "none",
    }}
  />
</Avatar>
  <Box flexGrow={1}>
    <Typography variant="h6" fontWeight="bold">
      {`Good ${getGreetingTime()} ${userData.name}`}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Have a productive {timeOfDay}!
    </Typography>
  </Box>
  {getTimeIcon(timeOfDay)}
</Card>

      {/* Reminder Card (Unchanged) */}
      <Card
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          mb: 2,
          bgcolor: alpha("#ff9800", 0.05),
          borderLeft: "5px solid #ff9800",
        }}
      >
        <AlarmOnIcon color="warning" sx={{ mr: 2 }} />
        <Box flexGrow={1}>
          <Typography fontWeight="bold">Check-in reminder</Typography>
          <Typography variant="body2">{getShiftMessage()}</Typography>
        </Box>
        <Box textAlign="right">
          <Typography fontWeight="bold">{userData.shift}</Typography>
          <Typography variant="body2" color="text.secondary">
            {userData.shiftStartTime } - { userData.shiftEndTime}
          </Typography>
        </Box>
      </Card>

      {/* Schedule Card (Unchanged) */}
      <Card sx={{ p: 2, mb: 2, bgcolor: alpha("#2196f3", 0.05), borderLeft: "5px solid #2196f3", overflowY: "auto" }}>
        {/* ... Schedule content ... */}
        <Box display="flex" alignItems="center" mb={2}>
          <CalendarMonthIcon color="info" sx={{ mr: 1 }} />
          <Typography fontWeight="bold" flexGrow={1}>
            Work Schedule
          </Typography>
          <Typography variant="body2"> {`${formatDate(workSchedule[0]?.date)} - ${formatDate(workSchedule[workSchedule.length - 1]?.date)}`}</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={1}>
          <Grid size={12}>
            <Box display="flex" justifyContent="space-between">
              <Typography fontWeight="bold">{userData.shift}</Typography>
              <Typography variant="body2" color="text.secondary">
                {userData.shiftHours}
              </Typography>
            </Box>
          </Grid>
          <Grid size={12}>
            <Box display="flex"justifyContent="space-around" mt={2}>
              {workSchedule.map(renderScheduleDay)}
            </Box>
          </Grid>
        </Grid>
      </Card>

 {/* --- Dynamic Time Logs Card (Updated to show all logs, with minutes conversion) --- */}
<Card
  elevation={0}
  sx={(theme) => ({
    p: 2.2,
    mb: 2,
    borderRadius: 4,
    border: "1px solid",
    borderColor: "divider",
    overflow: "hidden",
    boxShadow: `0 12px 34px ${alpha(theme.palette.common.black, 0.06)}`,
  })}
>
  {/* Header */}
  <Box
    sx={(theme) => ({
      display: "flex",
      alignItems: { xs: "flex-start", sm: "center" },
      justifyContent: "space-between",
      flexDirection: { xs: "column", sm: "row" },
      gap: 1.2,
      mb: 2,
      pb: 1.5,
      borderBottom: "1px solid",
      borderColor: "divider",
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(
        theme.palette.primary.light,
        0.12
      )} 60%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
      borderRadius: 3,
      px: 2,
      py: 1.6,
    })}
  >
    <Box>
      <Typography sx={{ fontWeight: 900 }} variant="subtitle1">
        Today&apos;s Time Logs
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.2 }}>
        Check-in, check-out & total duration
      </Typography>
    </Box>

    {/* quick count chip */}
    <Chip
      size="small"
      label={
        isLogLoading
          ? "Loading..."
          : `${processedData?.logs?.length || 0} logs`
      }
      sx={(theme) => ({
        fontWeight: 800,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.primary.main, 0.10),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.20)}`,
      })}
    />
  </Box>

  {/* Content */}
  {isLogLoading ? (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.2,
        py: 4,
      }}
    >
      <CircularProgress size={22} />
      <Typography variant="body2" color="text.secondary" fontWeight={700}>
        Fetching logs...
      </Typography>
    </Box>
  ) : !logsExist ? (
    // Empty State
    <Box
      sx={(theme) => ({
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 2,
        borderRadius: 3,
        border: "1px dashed",
        borderColor: alpha(theme.palette.secondary.main, 0.35),
        bgcolor: alpha(theme.palette.secondary.main, 0.06),
      })}
    >
      <Box
        sx={(theme) => ({
          width: 44,
          height: 44,
          borderRadius: 3,
          display: "grid",
          placeItems: "center",
          bgcolor: alpha(theme.palette.secondary.main, 0.12),
          color: theme.palette.secondary.main,
        })}
      >
        <AccessTimeIcon />
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 900 }}>
          No time logs for today
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Once you check-in/check-out, logs will appear here.
        </Typography>
      </Box>
    </Box>
  ) : (
    // Logs List (table-like)
    <Box
      sx={(theme) => ({
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha(theme.palette.success.main, 0.18),
        bgcolor: alpha(theme.palette.success.main, 0.04),
        overflow: "hidden",
      })}
    >
      {/* Header row */}
      <Box
        sx={(theme) => ({
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 1,
          px: 2,
          py: 1.2,
          bgcolor: alpha(theme.palette.text.primary, 0.03),
          borderBottom: "1px solid",
          borderColor: alpha(theme.palette.text.primary, 0.08),
        })}
      >
        <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary" }}>
          Check-In
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", textAlign: "center" }}>
          Check-Out
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", textAlign: "right" }}>
          Total Time
        </Typography>
      </Box>

      {/* Rows */}
      {processedData.logs?.map((log, index) => {
        const totalMins = parseFloat(log.Total_Time || 0);
        const hours = Math.floor(totalMins / 60);
        const mins = Math.round(totalMins % 60);
        const formattedTime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

        const checkIn = log.Check_In?.split(" ")[1] || "--:--";
        const checkOut = log.Check_Out?.split(" ")[1] || "--:--";

        return (
          <Box
            key={index}
            sx={(theme) => ({
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 1,
              px: 2,
              py: 1.2,
              alignItems: "center",
              borderBottom:
                index !== processedData.logs.length - 1
                  ? `1px solid ${alpha(theme.palette.text.primary, 0.08)}`
                  : "none",
              transition: "background 180ms ease",
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.06),
              },
            })}
          >
            <Typography sx={{ fontWeight: 800, color: "success.dark" }}>
              {checkIn}
            </Typography>

            <Typography sx={{ fontWeight: 800, color: "error.dark", textAlign: "center" }}>
              {checkOut}
            </Typography>

            <Typography sx={{ fontWeight: 900, color: "primary.main", textAlign: "right" }}>
              {formattedTime}
            </Typography>
          </Box>
        );
      })}
    </Box>
  )}
</Card>



      {/* --- End Dynamic Time Logs Card --- */}
    </Box>
  );
};

export default ActivityTab;