import React, { useEffect, useState,useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  MenuItem,
  IconButton,
  Modal,
  DialogContentText,
  CircularProgress,
  Tooltip,
  FormControl,Select,
  InputLabel,
  CssBaseline,
  Stack
} from "@mui/material";
import { IoTimeSharp } from "react-icons/io5";
import Avatar from "@mui/material/Avatar";
import Skeleton from "@mui/material/Skeleton";
import { FaClock } from "react-icons/fa6";
import { MdDateRange } from "react-icons/md";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import axios from "axios";
import { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchEmployees } from "../redux/Employee/EmployeeSlice";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { renderDigitalClockTimeView } from '@mui/x-date-pickers/timeViewRenderers';

import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import Collapse from "@mui/material/Collapse";
import TimeEntryApproval from "./TimeEntryApproval";
import AddTimeEntryRequest from "./AddTimeEntryRequest"
import { tickTimer,fetchRunningTimer } from "../redux/TimeEntryTimer/timerSlice";
import TaskTimerCard from "../components/TaskTimerCard";
import StopTimerDialog from "../components/StopTimerDialog";
export const EmpTimeEntry = ({
  // theme,
  // viewModalOpen,
  // viewTask,
  // setViewTask,
  // handleCloseViewModal,
}) => {
  // Create a ref for the TextField component
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
    const location = useLocation();
      const navigate = useNavigate();
    
    const { data: employeeData } = useSelector((state) => state.employeeReducer);
    
   



  const [darkMode] = useState(localStorage.getItem("darkMode") === "true");
    const colorCode = "#1976d2";
  const { data: AdminData } = useSelector((state) => state.AdminSlice);
  const user = useSelector((state) => state.user.user); // <-- access 'user' key


 const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: {
            main: AdminData?.Org_Theme || colorCode,
          },
          background: {
            default: darkMode ? "#121212" : "#fafafa",
            paper: darkMode ? "#1d1d1d" : "#fff",
          },
        },
      }),
    [darkMode, AdminData]
  );

  const viewTask = location.state?.task;

  // console.log("Thee ",viewTask);

  const handleFocus = (id) => {
    document.getElementById(id).showPicker();
  };
  const [show, setShow] = useState(false);
  const [alertLabel, setAlertLabel] = useState("");
  const [alerttype, setalerttype] = useState("");
  const [timeEntry, setTimeEntry] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userImage, setuserImage] = useState({});
  const [currUser, setCurrUser] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");
  const [errors, setErrors] = useState({});
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [todayTimeEntry, setTodayTimeEntry] = useState([]);
  const [viewModalOpen, setViewModalOpen] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
 const [filterType, setFilterType] = useState("All");
  const [editModalOpen, setEditModalOpen] = useState(false);
   const [currentEditTimeEntry, setcurrentEditTimeEntry] = useState({
    ROWID: "",
    name: "",
    date: "",
    startTime: "",
    endTime: "",
    note: "",
    type: "",
  });


 const [viewMode, setViewMode] = useState("ADD"); // ADD | HISTORY
const [expandedId, setExpandedId] = useState(null);

  const [open, setOpen] = useState(false);
  const[reqOpen, setReqOpen] = useState(false);
const [rows, setRows] = useState([
  {
    date: "",
    startTime: "",
    endTime: "",
    note: "",
    billable: "Yes",
    errors: {}, 
    rowError: null,
  },
]);









  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    navigate("/task");
  };


  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split("T")[0]; // format: YYYY-MM-DD
  });

  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split("T")[0];
  });

  const dateInputRef = useRef(null);

  const handleDateClick = () => {
    dateInputRef.current?.showPicker();
  };
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

  const handleTimeClick = (ref) => {
    ref.current?.showPicker();
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!newTimesheetEntry.date) tempErrors.date = "Date is required";
    if (!newTimesheetEntry.startTime)
      tempErrors.startTime = "Start time is required";
    if (!newTimesheetEntry.endTime) tempErrors.endTime = "End time is required";
    if (
      newTimesheetEntry.startTime &&
      newTimesheetEntry.endTime &&
      newTimesheetEntry.startTime >= newTimesheetEntry.endTime
    ) {
      tempErrors.endTime = "End time must be after start time";
    }
    if (!newTimesheetEntry.note) tempErrors.note = "Note is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0; // Returns true if no errors
  };

  const updateValidForm = () => {
    let tempErrors = {};

    if (!currentEditTimeEntry.date) tempErrors.date = "Date is required";
    if (!currentEditTimeEntry.startTime)
      tempErrors.startTime = "Start time is required";
    if (!currentEditTimeEntry.endTime)
      tempErrors.endTime = "End time is required";
    if (
      currentEditTimeEntry.startTime &&
      currentEditTimeEntry.endTime &&
      currentEditTimeEntry.startTime >= currentEditTimeEntry.endTime
    ) {
      tempErrors.endTime = "End time must be after start time";
    }
    if (!currentEditTimeEntry.note) tempErrors.note = "Note is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      handleAddTimesheetEntry();
    }
  };

  const handleOpenModal = (note) => {
    setSelectedNote(note);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedNote("");
  };




   function filterTimeEntriesByType(data, selectedType) {
    // console.log("type of ", selectedType);
    return data
      .map((entry) => {
        const filteredDetails = entry.details.filter(
          (item) => item.Time_Entries.Type === selectedType
        );

        // Only return entry if it has matching time entries
        if (filteredDetails.length > 0) {
          return {
            ...entry,
            details: filteredDetails,
            totalTime: filteredDetails.reduce(
              (sum, item) => sum + parseInt(item.Time_Entries.Total_time),
              0
            ),
          };
        }

        return null;
      })
      .filter((entry) => entry !== null);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // console.log("viewTask", viewTask);

        const user = await JSON.parse(localStorage.getItem("currUser"));
        setCurrUser(user);
        // Fetch time entry data

        if (!Array.isArray(employeeData) || employeeData.length === 0) {
          await dispatch(fetchEmployees()).unwrap(); // wait until data is fetched
        }
        setIsLoading(true);
        const TimeEntryResponse = await axios.get(
          `/server/time_entry_management_application_function/timeentry/${viewTask.ROWID}`,
          {
            params: {
              startDate: startDate, // Selected start date
              endDate: endDate, // Selected end date
            },
          }
        );

        // console.log("Time Entries f:", TimeEntryResponse);

        const userProfile = {};

        // Use for...of loop to properly await async actions
        for (const timeEntry of TimeEntryResponse.data.data) {
          for (const item of timeEntry.details) {
            if (!userProfile.hasOwnProperty(item.Time_Entries.User_ID)) {
              // const response = await axios.get(
              //   `/server/time_entry_management_application_function/userprofile/${item.Time_Entries.User_ID}`
              // );
              const userID = item.Time_Entries.User_ID;
              const user = employeeData.filter(
                (employee) => employee.user_id === userID
              );
              const profileLink = user[0].profile_pic;
              if (profileLink != null) {
                userProfile[item.Time_Entries.User_ID] = profileLink;
              } else {
                userProfile[item.Time_Entries.User_ID] =
                  "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541";
              }
            }
          }
        }

        let entries = TimeEntryResponse.data.data;

        if (filterType != "All") {
          entries = filterTimeEntriesByType(
            TimeEntryResponse?.data?.data,
            filterType
          );
        }
        setuserImage(userProfile);
        setTimeEntry(entries);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [viewTask,filterType,employeeData]);

  const [newTimesheetEntry, setNewTimesheetEntry] = useState({
    user: currUser.firstName + " " + currUser.lastName,
    userId: currUser.userid,
    date: "",
    type: "Non-Billable",
    startTime: "",
    endTime: "",
    note: "",
    totalTime: "",
  });
  // console.log("sdahfjsd", newTimesheetEntry.date);
  const handleAlert = (type, label) => {
    setalerttype(type);
    setAlertLabel(label);
    setShow(true);
    setTimeout(() => {
      setShow(false);
      setAlertLabel("");
    }, 2000);
  };
  function formatTimeToAMPM(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesFormatted = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutesFormatted} ${ampm}`;
  }
  function formatTime(minutes) {
    let hrs = Math.floor(minutes / 60);
    let mins = minutes % 60;
    return `${hrs} hr ${mins} min`;
  }

  const handleTimesheetInputChange = (event) => {
    const { name, value } = event.target;
    // console.log("[name]", name, value);

    setNewTimesheetEntry((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddTimesheetEntry = async () => {
    if (!viewTask) return;

    const start = new Date(`1970-01-01T${newTimesheetEntry.startTime}`);
    const end = new Date(`1970-01-01T${newTimesheetEntry.endTime}`);
    const diffMs = (end - start) / (1000 * 60); // Total time in minutes

    if (diffMs <= 0) {
      handleAlert("Error", "End time must be greater than Start Time");
      return;
    }

    setLoading(true);
    setIsLoading(true);

    // console.log("hhih", newTimesheetEntry);


    try {
      // Post the new timesheet entry to the server
      const response = await axios.post(
        "/server/time_entry_management_application_function/timeentry",
        {
          Username: currUser.firstName + " " + currUser.lastName,
          User_ID: currUser.userid,
          Entry_Date: newTimesheetEntry.date,
          Note: newTimesheetEntry.note,
          Type: newTimesheetEntry.type,
          Start_time: formatTimeToAMPM(start),
          End_time: formatTimeToAMPM(end),
          Total_time: diffMs,
          Task_ID: viewTask.ROWID,
          Task_Name: viewTask.Task_Name,
          Project_ID: viewTask.ProjectID,
          Project_Name: viewTask.Project_Name,
        }
      );

      // After successfully posting, fetch the updated data
      const TimeEntryResponse = await axios.get(
        `/server/time_entry_management_application_function/timeentry/${viewTask.ROWID}`
      );

      // Update the state with the new data
      setTimeEntry(TimeEntryResponse.data.data);
      handleAlert("success", "Time Entry has been successfully submitted");

      // Reset the new timesheet entry fields
      setNewTimesheetEntry({
       user: currUser.firstName + " " + currUser.lastName,
    userId: currUser.userid,
    date: "",
    type: "Non-Billable",
    startTime: "",
    endTime: "",
    note: "",
    totalTime: "",
      });
    } catch (error) {
      handleAlert("error", "Time Entry is Already Added ");
    } finally {
      setLoading(false);
      setIsLoading(false); // Ensure isLoading is set back to false after completion
    }
  };

  const handleDeleteTimeEntry = async (ROWID) => {
    try {

      // Make the DELETE request to the server
      const response = await axios.delete(
        `/server/time_entry_management_application_function/timeentry/${ROWID}`
      );

      if (response.status === 200 || response.status === 204) {
        handleAlert("info", "Time Entry deleted");

        

        // Update the timeEntry state
        const updatedTimeEntry = timeEntry
          .map((entry) => {
            // For each entry, check if it has details to filter
            const updatedDetails = entry.details.filter(
              (detail) => detail.Time_Entries.ROWID !== ROWID
            );

            // If the details array is not empty, return the updated entry
            if (updatedDetails.length > 0) {
              return {
                ...entry,
                details: updatedDetails,
                totalTime: updatedDetails.reduce(
                  (total, detail) => total + detail.Time_Entries.Total_time,
                  0
                ), // Recalculate totalTime after removal
              };
            }

            // If there are no details left, return null to remove the entire entry
            return null;
          })
          .filter((entry) => entry !== null); // Filter out null entries

        // console.log("Updated Time Entries:", updatedTimeEntry);

        // Update the state with the new timeEntry array
        setTimeEntry(updatedTimeEntry);
      } else {
        // console.error("Failed to remove time entry:", response);
        handleAlert("error", "Failed to delete Time Entry");
      }
    } catch (error) {
      console.error("Error deleting time entry:", error);
      handleAlert("error", "Deleting Time Entry failed");
    }
  };
  const handleEditChange = (event) => {

    const { name, value } = event.target;
    setcurrentEditTimeEntry((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateSubmit = () => {
    if (updateValidForm()) {
      handleUpdateTimeEntry();
    }
  };

  const handleUpdateTimeEntry = async () => {
    setIsLoading(true);
    const start = new Date(`1970-01-01T${currentEditTimeEntry.startTime}`);
    const end = new Date(`1970-01-01T${currentEditTimeEntry.endTime}`);
    const diffMs = (end - start) / (1000 * 60); // Total time in minutes

    if (diffMs <= 0) {
      handleAlert("Error", "End time must be greater than Start Time");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(
        `/server/time_entry_management_application_function/timeentry/${currentEditTimeEntry.ROWID}`,
        {
          Username: currUser.firstName + " " + currUser.lastName,
          User_ID: currUser.userid,
          Entry_Date: currentEditTimeEntry.date,
          Note: currentEditTimeEntry.note,
          Type: currentEditTimeEntry.type,
          Start_time: formatTimeToAMPM(start),
          End_time: formatTimeToAMPM(end),
          Total_time: diffMs,
          Task_ID: viewTask.ROWID,
          Task_Name: viewTask.Task_Name,
          Project_ID: viewTask.Project_ID,
          Project_Name: viewTask.Project_Name,
        }
      );

      // POST success: fetch updated entries
      const TimeEntryResponse = await axios.get(
        `/server/time_entry_management_application_function/timeentry/${viewTask.ROWID}`,
        {
          params: {
            startDate: startDate,
            endDate: endDate,
          },
        }
      );

      setTimeEntry(TimeEntryResponse.data.data);
      handleAlert("success", "Time Entry has been successfully updated");

      // Close modal only on success
      setEditModalOpen(false);
    } catch (err) {
      handleAlert("error", "Time Entry is Already Added");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setcurrentEditTimeEntry({
      name: "",
      date: "",
      startTime: "",
      endTime: "",
      note: "",
    });
  };
  const handleEdit = (entry) => {
    try {
      // Convert AM/PM to 24-hour format
      const convertAMPMto24 = (timeStr) => {
        const [timePart, period] = timeStr.split(" ");
        const [hours, minutes] = timePart
          .split(":")
          .map((num) => parseInt(num, 10));

        if (isNaN(hours) || isNaN(minutes)) {
          throw new Error("Invalid time format");
        }

        let hour = hours;
        if (period === "PM" && hours !== 12) {
          hour += 12;
        } else if (period === "AM" && hours === 12) {
          hour = 0;
        }

        return `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      };

      const startTime = convertAMPMto24(entry.Time_Entries.Start_time);
      const endTime = convertAMPMto24(entry.Time_Entries.End_time);

      setcurrentEditTimeEntry({
        ROWID: entry.Time_Entries.ROWID,
        name: entry.Time_Entries.Username,
        date: entry.Time_Entries.Entry_Date,
        type: entry.Time_Entries.Type,
        startTime: startTime,
        endTime: endTime,
        note: entry.Time_Entries.Note,
      });

      setEditModalOpen(true);
    } catch (error) {
      console.error("Error in handleEdit:", error);
      handleAlert("error", "Failed to edit time entry: " + error.message);
    }
  };

  const handleOpenDeleteDialog = (entry) => {
    setEntryToDelete(entry);
    setOpenDeleteDialog(true);
  };

  // Close Dialog Without Deleting
  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setEntryToDelete(null);
  };

  // Confirm Delete
  const handleDeleteConfirm = () => {
    if (entryToDelete) {
      handleDeleteTimeEntry(entryToDelete.Time_Entries.ROWID);
    }
    setOpenDeleteDialog(false);
    setEntryToDelete(null);
  };

  const [expandedDate, setExpandedDate] = useState(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  const handleExpand = (date) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

 

  const handleFetchData = async () => {
    try {
      // console.log("Fetching data from", startDate, "to", endDate);
      setSubmitLoading(true);

      // Fetch data from your API using the selected dates
      const response = await axios.get(
        `/server/time_entry_management_application_function/timeentry/${viewTask.ROWID}`,
        {
          params: {
            startDate: startDate, // Selected start date
            endDate: endDate, // Selected end date
          },
        }
      );

      // Process the response data as needed
      setTimeEntry(response.data.data);
      setSubmitLoading(false);

      const userProfile = {};

      // Use for...of loop to properly await async actions
      for (const timeEntry of response.data.data) {
        for (const item of timeEntry.details) {
          if (!userProfile.hasOwnProperty(item.Time_Entries.User_ID)) {
            // const response = await axios.get(
            //   `/server/time_entry_management_application_function/userprofile/${item.Time_Entries.User_ID}`
            // );
            const userID = item.Time_Entries.User_ID;
            const user = employeeData.filter(
              (employee) => employee.user_id === userID
            );
            const profileLink = user[0].profile_pic;
            if (profileLink != null) {
              userProfile[item.Time_Entries.User_ID] = profileLink;
            } else {
              userProfile[item.Time_Entries.User_ID] =
                "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541";
            }
          }
        }
      }
      setuserImage(userProfile);
      // console.log("Fetched Data:", response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };



  const MAX_CHARS = 700;

const { isRunning,timerId } = useSelector((state) => state.timer);


const [stopOpen, setStopOpen] = useState(false);

useEffect(() => {
  let interval;
  if (isRunning) {
    interval = setInterval(() => {
      dispatch(tickTimer());
    }, 1000);
  }
  return () => clearInterval(interval);
}, [isRunning, dispatch]);

// useEffect(() => {
//   dispatch(fetchRunningTimer({ userId: user.userid }));
// }, [dispatch, user.userid]);



useEffect(() => {
  // If timer already exists in redux → do NOT call API
  if (isRunning && timerId) return;

  dispatch(fetchRunningTimer({ userId: user.userid }));
}, [dispatch, user.userid, isRunning, timerId]);


  

  return (
         <ThemeProvider theme={theme}>
              <CssBaseline />

    <div>
      {/* View Task Modal */}
      <Snackbar
        open={show}
        onClose={() => setShow(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={2000}
      >
        <Alert severity={alerttype}>{alertLabel}</Alert>
      </Snackbar>
      <Modal
        open={viewModalOpen}
        onClose={handleCloseViewModal}
        aria-labelledby="view-task-modal"
        aria-describedby="modal-for-viewing-task"
      >
        <Box
           sx={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
    bgcolor: theme.palette.background.paper,
    color: theme.palette.mode === "dark" ? "white" : "black",
    boxShadow: 24,
    overflow: "hidden",
    borderRadius: 0,
  }}
        >
   <Card
  elevation={0}
  sx={{
    position: "sticky",
    top: 0,
    zIndex: (theme) => theme.zIndex.modal + 1,
    backdropFilter: "blur(6px)",
    backgroundColor: (theme) => theme.palette.background.paper,
    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
  }}
>
  <CardContent
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
      pb: "16px !important",
      // Mobile: Wrap items; Desktop: Stay in one line
      flexWrap: { xs: "wrap", md: "nowrap" }, 
    }}
  >
  
 {/* LEFT: TITLE */}
<Typography
  id="view-task-modal"
  variant="h6"
  sx={{
    display: "flex",
    alignItems: "center",
    fontWeight: 600,
    flex: { xs: "1 1 100%", md: "1 1 60%" },
    minWidth: 0, // 🔑 Essential for ellipsis to work in flexbox
  }}
>
  <Tooltip title={viewTask?.Task_Name || ""} arrow placement="top">
    <Box
      component="span"
      sx={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        display: "block",
        maxWidth: { xs: "250px", md: "400px" }, // 🔑 Set a limit here
        cursor: "help",
      }}
    >
      {viewTask?.Task_Name}
    </Box>
  </Tooltip>

  <Box
    component="span"
    sx={{
      ml: 1,
      flexShrink: 0,
      color: "text.secondary",
      fontWeight: 500,
      whiteSpace: "nowrap"
    }}
  >
    — Time Entries
  </Box>
</Typography>

    {/* RIGHT: ACTIONS */}
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        // Mobile: Vertical stack; Desktop: Horizontal row
        flexDirection: { xs: "column", sm: "row" },
        gap: 1.2,
        flexShrink: 0,
        // Mobile: Auto width; Desktop: Reserved space
        minWidth: { xs: "100%", md: "420px" },
        justifyContent: "flex-end",
        // Align buttons to stretch on mobile for better UX
        "& > button, & > div": {
          width: { xs: "100%", sm: "auto" }
        }
      }}
    >
      {/* TIMER */}
      <TaskTimerCard
        task={viewTask}
        user={currUser}
        onStop={() => setStopOpen(true)}
      />

      <StopTimerDialog  task={viewTask} setTimeEntry={setTimeEntry} open={stopOpen} onClose={() => setStopOpen(false)} />

      {/* REQUEST APPROVAL */}
      {currUser.roleId === "17682000000035348" && (
        <Button variant="contained"
         disabled={isRunning}
        onClick={() => setReqOpen(true)}>
         Approve Entry
        </Button>
      )}

      {/* ADD ENTRY */}
      <Button variant="contained" 
       disabled={isRunning}
      onClick={() => setOpen(true)}>
        Request Entry
      </Button>

      {/* CLOSE ICON - Hidden on mobile stack, or placed at top? */}
      <CloseIcon
        onClick={handleCloseViewModal}
        sx={{
          cursor: "pointer",
          color: "grey.600",
          fontSize: 30,
          transition: "all 0.2s ease",
          "&:hover": {
            color: "error.main",
            transform: "scale(1.1)",
          },
          // Keep the close icon aligned right even in vertical stack
          alignSelf: { xs: "flex-end", sm: "center" }
        }}
      />
    </Box>
  </CardContent>
</Card>


          {/* Scrollable Content Section */}
          <Box sx={{ overflowY: "auto", height: "calc(100vh - 140px)" }}>
            {" "}
            {/* Adjusted height to accommodate the header */}
            {viewTask && (
              <>
                {/* Add Timesheet Entry Section */}
                <Box sx={{ mb: 4, ml: 2, mr: 2, position: "relative" }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Add Time Entry
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="User"
                        name="user"
                        fullWidth
                        value={`${currUser.firstName} ${currUser.lastName}`}
                        sx={{ mb: 2 }}
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <div className="dateInput" onClick={handleDateClick}>
                       
                        <TextField
                          label="Date"
                          name="date"
                          id="dateInput"
                          fullWidth
                          type="date"
                          inputRef={dateInputRef}
                          value={newTimesheetEntry.date}
                          InputLabelProps={{ shrink: true }}
                          onChange={handleTimesheetInputChange}
                        //  sx={{ mb: 2 }}
                          error={!!errors.date}
                          helperText={errors.date}
                          disabled={isRunning}
                          
                          inputProps={{
                            min: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago (inclusive of today)
                              .toISOString()
                              .split("T")[0],
                            max: new Date().toISOString().split("T")[0], // Only allow today and future dates
                          }}
                        />
                      </div>
                    </Grid>

                    <Grid item xs={12} sm={5}>
                      <div
                        className="timeInput1"
                       onClick={() => handleTimeClick(startTimeRef)}
                      >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <TimePicker
                          label="Start Time"
                         value={dayjs(newTimesheetEntry.startTime, 'HH:mm')}
                   
                          onChange={(newValue) => {
                            handleTimesheetInputChange({
                              target: { name: 'startTime', value: newValue.format('HH:mm') },
                            });
                          }}
                          timeSteps={{ minutes: 1 }}
                     slotProps={{
      textField: {
        fullWidth: true,
        error: !!errors.startTime,
        helperText: errors.startTime,
                disabled: isRunning,

      },

      
     
      popper: {
        sx: {
          // This targets the list element within the dropdown popup
          '& .MuiList-root': {
            scrollbarWidth: 'none', // For Firefox
            msOverflowStyle: 'none', // For IE and Edge
            '&::-webkit-scrollbar': { // For Chrome, Safari, and Opera
              display: 'none',
            },
          },
        },
      },
    }}
                        />
                      </LocalizationProvider>

                      </div>
                    </Grid>

                    <Grid item xs={12} sm={5}>
                      <div
                        className="timeInput2"
                        onClick={() => handleTimeClick(endTimeRef)}
                      >
                       
                       <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <TimePicker
            label="End Time"
            value={
               dayjs(newTimesheetEntry.endTime, "HH:mm")
              
            }
            onChange={(newValue) => {
              handleTimesheetInputChange({
                target: {
                  name: "endTime",
                  value: newValue.format("HH:mm"),
                },
              });
            }}
           timeSteps={{ minutes: 1 }}
   

             slotProps={{
      textField: {
        fullWidth: true,
        error: !!errors.endTime,
        helperText: errors.endTime,
                        disabled: isRunning,
      },
  
      popper: {
        sx: {
        
          '& .MuiList-root': {
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none', // For IE and Edge
            '&::-webkit-scrollbar': { // For Chrome, Safari, and Opera
              display: 'none',
            },
          },
        },
      },
    }}
          />
          </LocalizationProvider>
                      </div>
                    </Grid>

                    <Grid item xs={12} sm={2}>
                      <TextField
                        select
                        label="Type"
                        name="type"
                        value={newTimesheetEntry.type}
                        onChange={handleTimesheetInputChange}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          mb: 2,
                          "& .MuiInputBase-root": {
                            height: "56px", // Match default height of time inputs
                            display: "flex",
                            alignItems: "center",
                          },
                        }}
                      disabled ={isRunning}
                      >
                        <MenuItem value="Billable">Billable</MenuItem>
                        <MenuItem value="Non-Billable">Non-Billable</MenuItem>
                      </TextField>
                    </Grid>

                    {/* <Grid item xs={12}>
                      <TextField
                        label="Note"
                        name="note"
                        fullWidth
                        multiline
                        rows={4}
                        value={newTimesheetEntry.note}
                        onChange={handleTimesheetInputChange}
                        sx={{ mb: 2 }}
                        error={!!errors.note}
                        helperText={errors.note}
                      />
                    </Grid> */}
                    <Grid item xs={12}>
  <TextField
    label="Note"
    name="note"
    fullWidth
    multiline
    rows={4}
    value={newTimesheetEntry.note}
    onChange={(e) => {
      const val = e.target.value;
      if (val.length <= MAX_CHARS) {
        handleTimesheetInputChange(e); // your existing handler
      }
    }}
    sx={{ mb: 2 }}
    error={!!errors.note}
    helperText={
      errors.note
        ? errors.note
        : `${MAX_CHARS - newTimesheetEntry.note.length} characters left`
    }
    disabled = {isRunning}
  />
  
</Grid>

                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        sx={{ width: 100 }}
  disabled={loading || isRunning}   // ✅ safe
                      >
                        {loading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          "Add"
                        )}
                      </Button>
                    </Grid>
                  </Grid>

                  <Card sx={{ mt: 2, mb: 2, mx: 0 }}>
                    <CardContent
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 2,
                      }}
                    >
                      <Box
                       sx={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 2,
                        }}
                       >
                      <TextField
                        label="Start Date"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                      -
                      <TextField
                        label="End Date"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleFetchData}
                      >
                        {submitLoading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          "Submit"
                        )}
                      </Button>
                      </Box>

                       <FormControl size="small" sx={{ minWidth: 150 }}>
                                              <InputLabel id="filter-label">Filter</InputLabel>
                                              <Select
                                                labelId="filter-label"
                                                value={filterType}
                                                label="Filter"
                                                onChange={(e) => setFilterType(e.target.value)}
                                              >
                                                <MenuItem value="All">All</MenuItem>
                                                <MenuItem value="Billable">Billable</MenuItem>
                                                <MenuItem value="Non-Billable">Non-Billable</MenuItem>
                                              </Select>
                                            </FormControl>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ mb: 4, ml: 2, mr: 2 }}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow
                          sx={{ backgroundColor: theme.palette.primary.main }}
                        >
                          <TableCell
                            sx={{
                              color: theme.palette.primary.contrastText,
                              fontWeight: "bold",
                            }}
                          >
                            User
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.palette.primary.contrastText,
                              fontWeight: "bold",
                            }}
                          >
                             Created Date
                          </TableCell>
                           <TableCell
                            sx={{
                              color: theme.palette.primary.contrastText,
                              fontWeight: "bold",
                            }}
                          >
                            Date
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.palette.primary.contrastText,
                              fontWeight: "bold",
                            }}
                          >
                            Start Time
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.palette.primary.contrastText,
                              fontWeight: "bold",
                            }}
                          >
                            End Time
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.palette.primary.contrastText,
                              fontWeight: "bold",
                            }}
                          >
                            Total Time
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.palette.primary.contrastText,
                              fontWeight: "bold",
                            }}
                          >
                            Type
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.palette.primary.contrastText,
                              fontWeight: "bold",
                            }}
                          >
                            Source
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.palette.primary.contrastText,
                              fontWeight: "bold",
                            }}
                          >
                            Note
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.palette.primary.contrastText,
                              fontWeight: "bold",
                            }}
                          >
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      {isLoading ? (
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={7} sx={{ height: "300px" }}>
                              <Box sx={{ width: "100%" }}>
                                <Skeleton />
                                <Skeleton animation="wave" />
                                <Skeleton animation={false} />
                                <Skeleton />
                                <Skeleton animation="wave" />
                                <Skeleton animation={false} />
                                <Skeleton />
                                <Skeleton animation="wave" />
                                <Skeleton animation={false} />
                                <Skeleton />
                                <Skeleton animation="wave" />
                                <Skeleton animation={false} />
                              </Box>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      ) : timeEntry.length === 0 ? (
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={8}>
                              <Box
                                sx={{
                                  p: 3,
                                  textAlign: "center",
                                  minHeight: "200px",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <IoTimeSharp
                                  size={50}
                                  color={theme.palette.text.secondary}
                                />
                                <Typography variant="h5" color="text.secondary">
                                  No Time Entries Found
                                </Typography>
                                <Typography
                                  variant="body1"
                                  color="text.secondary"
                                >
                                  There are no time entry to display.
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      ) : (
                        <TableBody>
                          {timeEntry.map((item) => (
                            <React.Fragment key={item.entryDate}>
                              <TableRow>
                                <TableCell>
                                  <Button
                                    variant="outlined"
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <MdDateRange />
                                    {item.entryDate}
                                  </Button>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outlined"
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <FaClock />
                                    {formatTime(item.totalTime)}
                                  </Button>
                                </TableCell>

                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                              </TableRow>

                              {/* Render task details if 'viewTask' is true */}
                              {viewTask &&
                                item.details?.map((entry, index) => (
                                  <TableRow key={index}>
                                    <TableCell
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "18px",
                                      }}
                                    >
                                      <Avatar
                                        src={
                                          userImage[entry.Time_Entries.User_ID]
                                        }
                                      />
                                      <span>{entry.Time_Entries.Username}</span>
                                    </TableCell>
                                    <TableCell>
                                      {new Date(entry.Time_Entries.CREATEDTIME).toLocaleDateString()}
                                    </TableCell>

                                    <TableCell>
                                      {new Date(entry.Time_Entries.Entry_Date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                      {entry.Time_Entries.Start_time}
                                    </TableCell>
                                    <TableCell>
                                      {entry.Time_Entries.End_time}
                                    </TableCell>
                                    <TableCell>
                                      {formatTime(
                                        entry.Time_Entries.Total_time
                                      )}
                                    </TableCell>

                                    <TableCell>
                                      <Chip
                                        label={entry.Time_Entries.Type}
                                        color={
                                          entry.Time_Entries.Type === "Billable"
                                            ? "success"
                                            : "default"
                                        }
                                        size="small"
                                        sx={{
                                          fontWeight: "bold",
                                          textTransform: "capitalize",
                                        }}
                                      />
                                    </TableCell>

                                    <TableCell>
                                      {entry.Time_Entries.Source_Type ? (
                                        <Chip
                                          label="Sprint"
                                          size="small"
                                          sx={{
                                            fontWeight: "bold",
                                            backgroundColor: "#7c3aed",
                                            color: "#fff",
                                          }}
                                        />
                                      ) : (
                                        <Chip label="Task" size="small" variant="outlined" />
                                      )}
                                    </TableCell>

                                    <TableCell>
                                      <Tooltip
                                        title={
                                          <Typography
                                            sx={{
                                              fontSize: "1rem",
                                              fontWeight: 500,
                                            }}
                                          >
                                            {entry.Time_Entries.Note}
                                          </Typography>
                                        }
                                        placement="top"
                                        arrow
                                        slotProps={{
                                          tooltip: {
                                            sx: {
                                              borderRadius: "10px",
                                              boxShadow:
                                                "0px 4px 12px rgba(0, 0, 0, 0.1)",
                                              p: 1.5,
                                              maxWidth: 300,
                                            },
                                          },
                                          arrow: {
                                            sx: {
                                              color: "#fefefe",
                                            },
                                          },
                                        }}
                                      >
                                        <IconButton color="primary">
                                          <DescriptionIcon />
                                        </IconButton>
                                      </Tooltip>
                                    </TableCell>

                                    <TableCell>
                                        <>
                                          <IconButton
                                            color="primary"
                                            onClick={() => handleEdit(entry)}
                                          >
                                            <EditIcon />
                                          </IconButton>
                                          <IconButton
                                            color="error"
                                            onClick={() =>
                                              handleOpenDeleteDialog(entry)
                                            }
                                          >
                                            <DeleteIcon />
                                          </IconButton>
                                        </>

                                    </TableCell>


                                  </TableRow>
                                ))}
                            </React.Fragment>
                          ))}
                        </TableBody>
                      )}
                    </Table>
                  </TableContainer>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Modal>
      {/* edit time entry model */}
      <Modal open={editModalOpen} onClose={handleEditCancel}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%", // Reduced width to 60%
            maxHeight: "80vh", // Set max height to 80% of viewport height
            overflowY: "auto", // Add scroll if content exceeds max height
            padding: 4,
            backgroundColor: (theme) => theme.palette.background.paper,
            boxShadow: 24,
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" sx={{ marginBottom: 2 }}>
            Edit Time Entry
          </Typography>
          <TextField
            label="User"
            name="user"
            fullWidth
            variant="outlined"
            value={currUser.firstName + " " + currUser.lastName}
            onChange={handleEditChange}
            sx={{ marginBottom: 2 }}
            disabled
          />
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                name="date"
                fullWidth
                variant="outlined"
                type="date"
                value={currentEditTimeEntry?.date || ""}
                onChange={handleEditChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Type"
                name="type"
                fullWidth
                variant="outlined"
                value={currentEditTimeEntry?.type || ""}
                onChange={handleEditChange}
              >
                <MenuItem value="Billable">Billable</MenuItem>
                <MenuItem value="Non-Billable">Non-Billable</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <div
                className="timeInput"
                onFocus={() => handleFocus("timeInput3")}
              >
                <TextField
                  label="Start Time"
                  name="startTime"
                  id="timeInput3"
                  fullWidth
                  type="time"
                  value={currentEditTimeEntry?.startTime || ""}
                  onChange={handleEditChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                  error={!!errors.startTime}
                  helperText={errors.startTime}
                />
              </div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <div
                className="timeInput"
                onFocus={() => handleFocus("timeInput4")}
              >
                <TextField
                  label="End Time"
                  id="timeInput4"
                  name="endTime"
                  fullWidth
                  type="time"
                  value={currentEditTimeEntry?.endTime || ""}
                  onChange={handleEditChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                  inputRef={endTimeRef}
                  error={!!errors.endTime}
                  helperText={errors.endTime} // Attach the ref to the TextField
                />
              </div>
            </Grid>
          </Grid>
          <TextField
            label="Note"
            name="note"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={currentEditTimeEntry?.note || ""}
            onChange={handleEditChange}
            sx={{ marginBottom: 2 }}
            error={!!errors.note}
            helperText={errors.note}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 3,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateSubmit}
            >
              Save Changes
            </Button>
            <Button variant="outlined" color="error" onClick={handleEditCancel}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: "16px",
            padding: "20px",
            backgroundColor: "#f5f5f5",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "1.5rem",
            color: "#3f51b5",
          }}
        >
          📝 Note
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            textAlign: "center",
            margin: "20px 0",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
          }}
        >
          <Typography
            variant="body1"
            sx={{ color: "#333", fontSize: "1.1rem" }}
          >
            {selectedNote}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button
            onClick={handleCloseModal}
            variant="contained"
            color="primary"
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: "bold",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleDeleteCancel}>
        <DialogTitle id="alert-dialog-title">{"Delete Time Entry"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete Time Entry{" "}
            <strong>{entryToDelete?.Time_Entries?.Username}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
{/* 
      
      <Dialog
  open={open}
  fullWidth
  maxWidth="md"
  PaperProps={{
    sx: {
      borderRadius: 3,
      p: 1,
    },
  }}
>

<DialogTitle
  sx={{
    fontWeight: 600,
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  {viewMode === "ADD" ? "Add Time Entries" : "Time Entry History"}

  <Button
    size="small"
    variant="outlined"
    onClick={() =>
      setViewMode(prev => (prev === "ADD" ? "HISTORY" : "ADD"))
    }
  >
    {viewMode === "ADD" ? "History" : "Add Time Entry"}
  </Button>
</DialogTitle>

{viewMode === "ADD" ? (
<DialogContent 
sx={{
    mt: 2,
    maxHeight: "60vh",
    overflowY: "auto",
  }}
>
{rows.map((row, i) => (
  <Box
    key={i}
    sx={{
      mb: 3,
      p: 2,
      borderRadius: 2,
      border: row.rowError
        ? `1px solid ${theme.palette.error.main}`
        : '1px solid #e0e0e0',
      backgroundColor: row.rowError
        ? `${theme.palette.error.light}22`
        : 'transparent',
      position: 'relative',
    }}
  >
   
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <TextField
          label="Date"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={row.date}
          onChange={(e) => handleChange(i, 'date', e.target.value)}
          error={Boolean(row.errors?.date)}
          helperText={row.errors?.date}
        />
      </Grid>

      <Grid item xs={3}>
        <TextField
          select
          label="Billable"
          fullWidth
          value={row.billable}
          onChange={(e) => handleChange(i, 'billable', e.target.value)}
        >
          <MenuItem value="Yes">Billable</MenuItem>
          <MenuItem value="No">Non-Billable</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={3}>
        <TextField
          label="Start Time"
          type="time"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={row.startTime}
          onChange={(e) =>
            handleChange(i, 'startTime', e.target.value)
          }
          error={Boolean(row.errors?.startTime)}
          helperText={row.errors?.startTime}
        />
      </Grid>

      <Grid item xs={3}>
        <TextField
          label="End Time"
          type="time"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={row.endTime}
          onChange={(e) => handleChange(i, 'endTime', e.target.value)}
          error={Boolean(row.errors?.endTime)}
          helperText={row.errors?.endTime}
        />
      </Grid>
    </Grid>

 
    <TextField
      label="Notes"
      multiline
      rows={3}
      fullWidth
      sx={{ mt: 2 }}
      value={row.note}
      onChange={(e) => handleChange(i, 'note', e.target.value)}
      error={Boolean(row.errors?.note)}
      helperText={row.errors?.note}
    />

  
    {row.rowError && (
      <Box sx={{ mt: 0.5 }}>
        <Typography variant="caption" color="error">
          ⚠ {row.rowError}
        </Typography>
      </Box>
    )}

    {rows.length > 1 && (
      <IconButton
        size="small"
        onClick={() => removeRow(i)}
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          color: 'error.main',
          bgcolor: 'background.paper',
          boxShadow: 1,
          '&:hover': {
            bgcolor: 'error.light',
            color: 'error.contrastText',
          },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    )}
  </Box>
))}


  


    
   

  <Button sx={{ mt: 1 }} onClick={addRow}>
    + Add Entry
  </Button>
</DialogContent>
):(
  
    <DialogContent
        sx={{
          mt: 2,
          maxHeight: "65vh",
          overflowY: "auto",
        }}
      >
        {approvals.map(item => (
          <Box
            key={item.ROWID}
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 2,
              border: "1px solid #e0e0e0",
            }}
          >
        
            <Grid container alignItems="center">
              <Grid item xs={3}>
                <Typography fontWeight={600}>{`REQ-${item.ROWID.slice(-4)}`}</Typography>
              </Grid>

              <Grid item xs={3}>
                <Chip
                  size="small"
                  label={item.Status}
                  color={
                    item.Status === "Approved"
                      ? "success"
                      : item.Status === "Rejected"
                      ? "error"
                      : "warning"
                  }
                />
              </Grid>

              <Grid item xs={3}>
                <Typography>
                  Entries: {item.Timeentry_Data.length}
                </Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography>{item.CreatedDate}</Typography>
              </Grid>

              <Grid item xs={1} textAlign="right">
                <IconButton
                  size="small"
                  onClick={() =>
                    setExpandedId(prev =>
                      prev === item.ROWID ? null : item.ROWID
                    )
                  }
                >
                  {expandedId === item.ROWID ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  )}
                </IconButton>
              </Grid>
            </Grid>

          
            <Collapse in={expandedId === item.ROWID}>
              <Box sx={{ mt: 2 }}>
              
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {item.Status === "Approved" && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Approved By:</strong> {item.ApprovedBy}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Approved Date:</strong>{" "}
                          {item.ApproveDate}
                        </Typography>
                      </Grid>
                    </>
                  )}

                  {item.Status === "Rejected" && (
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Reason:</strong> {item.Reason}
                      </Typography>
                    </Grid>
                  )}
                </Grid>

             
                <Box
                  sx={{
                    maxHeight: 220,
                    overflowY: "auto",
                    border: "1px solid #eee",
                    borderRadius: 1,
                    p: 1,
                  }}
                >
                  {item.Timeentry_Data.map(entry => (
                    <Box
                      key={entry.ROWID}
                      sx={{
                        mb: 1.5,
                        p: 1.5,
                        borderRadius: 1,
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Date:</strong> {entry.Entry_Date}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Type:</strong> {entry.Type}
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Start:</strong> {entry.Start_time}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>End:</strong> {entry.End_time}
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Project:</strong>{" "}
                            {entry.Project_Name}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Task:</strong> {entry.Task_Name}
                          </Typography>
                        </Grid>

                        <Grid item xs={12}>
                          <Typography variant="body2">
                            <strong>Note:</strong> {entry.Note}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Collapse>
          </Box>
        ))}
      </DialogContent>
)}


{viewMode === "ADD" && (
  <DialogActions
    sx={{ px: 3, py: 2, borderTop: "1px solid #e0e0e0" }}
  >
    <Button onClick={handleCancelReq}>Cancel</Button>
    <Button variant="contained" onClick={handleRequest}>
      Submit Entries
    </Button>
  </DialogActions>
)}


</Dialog> */}

{currUser?.roleId === "17682000000035348" && (
  <TimeEntryApproval
    userId={currUser.userid}
    reqOpen={reqOpen}
url={`/server/time_entry_management_application_function/timeentry/approval?userId=${currUser.userid}&taskId=${viewTask.ROWID}`}
    onClose={() => setReqOpen(false)}
  />
)}


<AddTimeEntryRequest open = {open}
onClose={()=> setOpen(false)}
viewTask={viewTask}
currUser={currUser}
/>

  </div>
    </ThemeProvider>
 
    
  );
};
