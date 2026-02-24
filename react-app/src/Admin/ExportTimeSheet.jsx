import React, { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  Button,
  MenuItem,
  Snackbar,
  CircularProgress,
  Select,
  OutlinedInput,
  Chip,
  FormControl,
  InputLabel,
  Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { fetchEmployees } from "../redux/Employee/EmployeeSlice";
import { fetchProjects } from "../redux/Project/ProjectSlice";
import { fetchTasks } from "../redux/Tasks/TaskSlice";
import { ConnectingAirportsOutlined } from "@mui/icons-material";
import { showSnackbar } from "../redux/Snackbar/SnackbarSlice";


const BASE_URL = "/server/bulk-function/bulk";

export const ExportTimeSheet = ({ open, toggleSheetDrawer }) => {
  const dispatch = useDispatch();

  const { data: employeedata } = useSelector((state) => state.employeeReducer);
  const { data: projectData } = useSelector((state) => state.projectReducer);
  const { data: taskData } = useSelector((state) => state.taskReducer);


  const [type, setType] = useState("");
  const [formData, setFormData] = useState({
    selectedIds: [],
    start_date: "",
    end_date: "",
  });
 

  useEffect(() => {
    if (!Array.isArray(projectData) || projectData.length === 0) {
      dispatch(fetchProjects());
    }
    if (!Array.isArray(employeedata) || employeedata.length === 0) {
      dispatch(fetchEmployees());
    }
    if (!Array.isArray(taskData) || taskData.length === 0) {
      dispatch(fetchTasks());
    }
  }, [dispatch]);

  // ---- API HANDLERS ----
  const createBulkJob = async (payload) => {
    const res = await axios.post(`${BASE_URL}/create`, payload);
    return res.data.jobId;
  };

  const pollJobStatus = async (jobId) => {
    let timerId;

    const checkStatus = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/status/${jobId}`);
        if (res.data.status === "Completed") {
          if (timerId) clearTimeout(timerId);
         dispatch(
    showSnackbar({
      message: "Timesheet ready!",
      loading: false,
      action: (
        <Button
          color="inherit"
          size="small"
          onClick={() => downloadTimesheet(jobId)}
        >
          Download
        </Button>
      ),
    })
  );
        } else if (res.data.status === "Failed") {
          if (timerId) clearTimeout(timerId);
       dispatch(showSnackbar({ message: "Export failed!", loading: false }));
        } else {
          timerId = setTimeout(checkStatus, 3000);
        }
      } catch (err) {
        if (timerId) clearTimeout(timerId);
        dispatch(showSnackbar({ message: "Error checking status", loading: false }));
      }
    };

    checkStatus();
  };

  // const downloadTimesheet = (jobId) => {
  //   try {
  //     console.log("time entry",jobId)
  //         const tableName = "Time_Entries"; // static table name

  //   const downloadUrl = `${BASE_URL}/download/${jobId}?tableName=${encodeURIComponent(tableName)}`;
  //     const link = document.createElement("a");
  //     link.href = downloadUrl;
  //     link.setAttribute("download", `Timesheet_${jobId}.csv`);
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();
  //   } catch (err) {
  //     console.error("Download failed", err);
  //   }
  // };


const downloadTimesheet = async (jobId) => {
  try {
    const tableName = "Time_Entries"; // static table name

   const response = await axios.get(
  `${BASE_URL}/download/${jobId}`,
  {
    params: { tableName },   // send tableName as query param
    responseType: "blob",    // important for file downloads
  }
);;

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Timesheet_${jobId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error("Download failed", err);
  }
};

//   const adjustDateRange = (startDate, endDate) => {
//   const start = new Date(startDate);
//   const end = new Date(endDate);

//   // Subtract 1 day from start
//   start.setDate(start.getDate() - 1);

//   // Add 1 day to end
//   end.setDate(end.getDate() + 1);

//   return {
//     adjustedStart: start.toISOString().split("T")[0],
//     adjustedEnd: end.toISOString().split("T")[0],
//   };
// };

const adjustDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) {
    return { adjustedStart: "", adjustedEnd: "" };
  }

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start) start.setDate(start.getDate() - 1);
  if (end) end.setDate(end.getDate() + 1);

  return {
    adjustedStart: start ? start.toISOString().split("T")[0] : "",
    adjustedEnd: end ? end.toISOString().split("T")[0] : "",
  };
};


// Example




const handleExport = async () => {
  try {
    toggleSheetDrawer(false);
    dispatch(showSnackbar({ message: "Starting export...", loading: true }));


    let criteriaGroup = [];
    // console.log("typeee",type)

    // IDs criteria (each added separately)
    if (formData.selectedIds.length > 0) {
      formData.selectedIds.forEach((id) => {
        if (type === "Project") { 
          criteriaGroup.push({
            column_name: "Project_ID",
            comparator: "equal",
            value: id,
          });
        } else if (type === "User") {
          criteriaGroup.push({
            column_name: "User_ID",
            comparator: "equal",
            value: id,
          });
        } else if (type === "Task") {
          criteriaGroup.push({
            column_name: "Task_ID",
            comparator: "equal",
            value: id,
          });
        }
      });
    }
    // console.log("the items are ",criteriaGroup);

    const { adjustedStart, adjustedEnd } = adjustDateRange(formData.start_date, formData.end_date);
   
  
    // Date filters
    if (formData.start_date) {
      criteriaGroup.push({
        column_name: "Entry_Date",
        comparator: "greater_than",
        value: adjustedStart,
      });
    }
    if (formData.end_date) {
      criteriaGroup.push({
        column_name: "Entry_Date",
        comparator: "less_than",
        value: adjustedEnd,
      });
    }

    // console.log("the items are ",criteriaGroup);

    const jobId = await createBulkJob({
      tableName: "Time_Entries",
      criteria: {
        group_operator: "and", // backend will check all
        group: criteriaGroup,
      },
      columns: [
        "Username",
        "Entry_Date",
        "Note",
        "Task_ID",
        "Start_time",
        "End_time",
        "Total_time",
        "User_ID",
        "Task_Name",
        "Project_ID",
        "Project_Name",
        "Type",
      ],
    });

      dispatch(showSnackbar({ message: "Preparing timesheet...", loading: true }));

    pollJobStatus(jobId);
  } catch (err) {
    dispatch(showSnackbar({ message: "Export failed!", loading: false }));
  }
};


  // Render dropdown list options
  const renderOptions = () => {
    if (type === "Project") {
      return projectData.map((p) => ({
        id: p.ROWID,
        label: p.Project_Name,
      }));
    } else if (type === "User") {
      return employeedata.map((u) => ({
        id: u.user_id,
        label: `${u.first_name} ${u.last_name}`,
      }));
    } else if (type === "Task") {
      return taskData.map((t) => ({
        id: t.ROWID,
        label: t.Task_Name,
      }));
    }
    return [];
  };

  return (
    <>
      <Drawer anchor="right" open={open} onClose={() => toggleSheetDrawer(false)}>
        <Box
          sx={{
            width: 400,
            padding: 2,
            position: "relative",
            maxHeight: "90vh",
            overflowY: "auto",
            marginTop: "70px",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              px: 2,
              py: 1.5,
              borderRadius: 2,
              backgroundColor: "primary.main",
              boxShadow: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", color: "#fff" }}>
              <FileDownloadIcon sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Export Timesheet
              </Typography>
            </Box>
            <Tooltip title="Close">
              <IconButton
                onClick={() => toggleSheetDrawer(false)}
                sx={{
                  color: "#fff",
                  transition: "transform 0.2s ease",
                  "&:hover": { transform: "scale(1.2)" },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Select Type */}
          <TextField
            label="Select Type"
            select
            fullWidth
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setFormData({ selectedIds: [], start_date: "", end_date: "" });
            }}
            sx={{ mb: 2 }}
          >
            <MenuItem value="Project">Project</MenuItem>
            <MenuItem value="User">User</MenuItem>
            <MenuItem value="Task">Task</MenuItem>
          </TextField>

          {/* Dynamic Multi Select */}
        {type && (
  <Autocomplete
    multiple
    options={renderOptions()} // [{ id, label }]
    getOptionLabel={(option) => option.label}
    value={renderOptions().filter((opt) =>
      formData.selectedIds.includes(opt.id)
    )}
    onChange={(_, newValue) =>
      setFormData({ ...formData, selectedIds: newValue.map((v) => v.id) })
    }
    renderTags={(value, getTagProps) =>
      value.map((option, index) => (
        <Chip
          key={option.id}
          label={option.label}
          {...getTagProps({ index })}
        />
      ))
    }
    renderInput={(params) => (
      <TextField {...params} label={`Select ${type}(s)`} />
    )}
    sx={{ mb: 2 }}
  />
)}

          {/* Date pickers */}
          {type && (
            <>
              <TextField
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                label="End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                sx={{ mb: 2 }}
              />
            </>
          )}

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 3,
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleExport}
              sx={{ width: 120 }}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => toggleSheetDrawer(false)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Drawer>

 
   
    </>
  );
};
