

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Divider,
  Button,
  alpha,
  MenuItem,
  Select,
  FormControl,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const AttendanceTab = ({userData}) => {
  const [selectedRange, setSelectedRange] = useState("thisWeek");
  const [workSchedule, setWorkSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // ✅ Calculate start & end date
  const getDateRange = (range) => {
    const today = new Date();
    let start, end;

    if (range === "thisWeek") {
      start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else if (range === "previousWeek") {
      end = new Date(today);
      end.setDate(today.getDate() - today.getDay() - 1);
      start = new Date(end);
      start.setDate(end.getDate() - 6);
    } else if (range === "thisMonth") {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (range === "previousMonth") {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
    }

    const format = (d) => d.toISOString().split("T")[0];
    return { start, end, startStr: format(start), endStr: format(end) };
  };

 
  const fetchAttendance = async (startStr, endStr, employeeId = "") => {
    try {
        const userId = userData.id;
        // console.log("userId from ", userId);
      setLoading(true);
      const response = await axios.post(
        "/server/time_entry_management_application_function/attendance/dashboard",
       { UserID: userId,}, {
          params: {
            Start_date: startStr,
            End_date: endStr,
           
          },
        }
      );
   

      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching attendance:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

const buildSchedule = (range, attendance = []) => {
  const { start, end } = getDateRange(range);
  const schedule = [];
  let current = new Date(start);

  while (current <= end) {
    // const dateStr = current.toISOString().split("T")[0];
      const dateStr = current.toLocaleDateString("en-CA"); 

    const dayIndex = current.getDay();

    // Find attendance for this date
    const record = attendance.find((a) => a.Day_Date === dateStr);

    let status;
    if (dayIndex === 0 || dayIndex === 6) {
      status = "Weekend";
    } else if (record && record.Check_In) {
      status = "Present";
    } else {
      status = "Absent";
    }

    schedule.push({
      day: days[dayIndex],
      date: new Date(current.getTime()),   // <-- prevents mutation bug
      status,
      checkIn: record?.Check_In || null,
      checkOut: record?.Check_Out || null,
    });

    current.setDate(current.getDate() + 1);
  }

  return schedule;
};


  // ✅ Fetch & build schedule when range changes
  useEffect(() => {
    const loadData = async () => {
      const { startStr, endStr } = getDateRange(selectedRange);
      const attendance = await fetchAttendance(startStr, endStr);
      const schedule = buildSchedule(selectedRange, attendance);
      setWorkSchedule(schedule);
    };

    loadData();
  }, [selectedRange]);

const handleRangeChange = (e) => setSelectedRange(e.target.value);

  const renderDayRow = (day) => (
  <Box
    key={day.date}
    sx={{
      display: "flex",
      alignItems: "center",
      bgcolor: day.status === "Weekend" ? alpha("#ff9800", 0.08) : "background.paper",
      borderBottom: "1px solid #e0e0e0",
      p: 1,
    
    }}
  >
    {/* Day & Date */}
    <Box sx={{ width: "80px", textAlign: "center" }}>
      <Typography
        variant="body2"
        fontWeight={day.status === "Absent" ? "bold" : "medium"}
        color={day.status === "Absent" ? "error.main" : "text.primary"}
      >
        {day.day}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {day.date.getDate().toString().padStart(2, "0")}{" "}
        {day.date.toLocaleString("default", { month: "short" })}
      </Typography>
    </Box>

    <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

    {/* Shift info */}
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="body2" fontWeight="bold">
        General
      </Typography>
      <Typography variant="caption" color="text.secondary">
        9:00 AM - 7:00 PM
      </Typography>
    </Box>

    {/* Status / Actions */}
    <Box textAlign="right" sx={{ minWidth: "170px" }}>
      {day.status === "Weekend" ? (
        <Typography variant="body2" color="error.main">
          Weekend
        </Typography>
      ) : day.status === "Absent" ? (
        <Typography variant="body2" color="error.main">
          Absent
        </Typography>
      ) : (
        <Typography variant="body2" color="success.main">
          Present
        </Typography>
      )}
      
    </Box>
  </Box>
);


  return (
   <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
  {/* Header */}
  <Box
    sx={(theme) => ({
      display: "flex",
      alignItems: { xs: "flex-start", sm: "center" },
      justifyContent: "space-between",
      flexDirection: { xs: "column", sm: "row" },
      gap: 1.5,
      mb: 2,
      p: 2,
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(
        theme.palette.primary.light,
        0.12
      )} 60%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
    })}
  >
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
        Attendance
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
        View your schedule & daily status
      </Typography>
    </Box>

    <FormControl
      size="small"
      sx={{
        minWidth: { xs: "100%", sm: 220 },
      }}
    >
      <Select
        value={selectedRange}
        onChange={handleRangeChange}
        displayEmpty
        sx={(theme) => ({
          borderRadius: 2,
          bgcolor: "background.paper",
          "& .MuiSelect-select": {
            py: 1.1,
            fontWeight: 800,
          },
        })}
      >
        <MenuItem value="thisWeek">This Week</MenuItem>
        <MenuItem value="previousWeek">Previous Week</MenuItem>
        <MenuItem value="thisMonth">This Month</MenuItem>
        <MenuItem value="previousMonth">Previous Month</MenuItem>
      </Select>
    </FormControl>
  </Box>

  {/* Content */}
  <Card
    elevation={0}
    sx={(theme) => ({
      borderRadius: 4,
      border: "1px solid",
      borderColor: "divider",
      overflow: "hidden",
      boxShadow: `0 12px 34px ${alpha(theme.palette.common.black, 0.06)}`,
    })}
  >
    {/* Scroll container */}
    <Box
      sx={{
        maxHeight: { xs: "60vh", md: "70vh" },
        overflowY: "auto",
        overflowX: "auto",
        "&::-webkit-scrollbar": { width: 6, height: 6 },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(0,0,0,0.18)",
          borderRadius: 10,
        },
      }}
    >
      {loading ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.2,
            p: 4,
          }}
        >
          <CircularProgress size={22} />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 800 }}>
            Loading attendance...
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minWidth: { xs: 520, sm: 700 }, // only when needed
            p: 1.5,
            gap: 1,
          }}
        >
          {workSchedule.map(renderDayRow)}
        </Box>
      )}
    </Box>
  </Card>
</Box>

  );
};

export default AttendanceTab;
