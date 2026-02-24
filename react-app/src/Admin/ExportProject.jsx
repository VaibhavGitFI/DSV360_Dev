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
  Chip,
  Autocomplete,
} from "@mui/material";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useSelector, useDispatch } from "react-redux";
import { fetchEmployees } from "../redux/Employee/EmployeeSlice";
import { fetchProjects } from "../redux/Project/ProjectSlice";
import { fetchTasks } from "../redux/Tasks/TaskSlice";
import { hideSnackbar, showSnackbar } from "../redux/Snackbar/SnackbarSlice";
import { Form } from "react-router-dom";


const BASE_URL = "/server/bulk-function/bulk";
const ExportProject = ({ open, toggleSheetDrawer }) => {
  const dispatch = useDispatch();


  const { data: projectData } = useSelector((state) => state.projectReducer);
 

  const [filterBy, setFilterBy] = useState("");
  const [formData, setFormData] = useState({
   selectedId: "",
    start_date: "",
    end_date: "",
    status :"",
  });


  // console.log("my dtaa a aa",formData);

  useEffect(() => {
    if (!Array.isArray(projectData) || projectData.length === 0) {
      dispatch(fetchProjects());
    }
  }, [dispatch]);

  // Unique statuses from projectData
  const uniqueStatuses = [
    ...new Set(projectData.map((p) => p.Status).filter(Boolean)),
  ];


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
        message: "Project Sheet is ready!",
        loading: false,
        action: (
          <Button
            color="primary"
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
  


const downloadTimesheet = async (jobId) => {
  try {
    const tableName = "Projects"; // static table name
   const response = await axios.get(
  `${BASE_URL}/download/${jobId}`,
  {
    params: { tableName },   // send tableName as query param
    responseType: "blob",    // important for file downloads
  }
);

    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", `Projects${jobId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
    
  } catch (err) {
    console.error("Download failed", err);
  }
};

  
 const adjustDateRange = (startDate, endDate) => {
  let adjustedStart = "";
  let adjustedEnd = "";

  if (startDate) {
    const start = new Date(startDate);
    start.setDate(start.getDate() - 1); // subtract 1 day
    adjustedStart = start.toISOString().split("T")[0];
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1); // add 1 day
    adjustedEnd = end.toISOString().split("T")[0];
  }

  return { adjustedStart, adjustedEnd };
};

  // Example
  
  
  
  
  const handleExport = async () => {
  try {
    toggleSheetDrawer(false);
    dispatch(showSnackbar({ message: "Starting export ...", loading: true }));

    let criteriaGroup = [];
    // console.log("typeee", filterBy);

    // Single selection criteria
    if (formData.selectedId) {
     
      if (filterBy === "Project") {
        criteriaGroup.push({
          column_name: "ROWID",
          comparator: "equal",
          value: formData.selectedId,
        });
      } else if (filterBy === "User") {
        criteriaGroup.push({
          column_name: "Assigned_To_Id",
          comparator: "equal",
          value: formData.selectedId,
        });
      }
    }

    // Adjust date range
   

    if (filterBy === "Status") {
      criteriaGroup.push({
        column_name: "Status",
        comparator: "equal",
        value: formData.status,
      });
    }
    
 const { adjustedStart, adjustedEnd } = adjustDateRange(formData.start_date, formData.end_date);

    // Date filters
    if (formData.start_date) {
      criteriaGroup.push({
        column_name: "Start_Date",
        comparator: "greater_than",
        value: adjustedStart,
      });
    }
    if (formData.end_date) {
      criteriaGroup.push({
        column_name: "End_Date",
        comparator: "less_than",
        value: adjustedEnd,
      });
    }

    // console.log("the items are ", criteriaGroup);

  let jobId = "";
  if(criteriaGroup.length == 0){
       jobId = await createBulkJob({
      tableName: "Projects",
      columns: [
        "Project_Name",
        "Status",
        "Start_Date",
        "End_Date",
        "Owner",
        "Assigned_To",
        "Assigned_To_Id",
        "Client_Name",
      ],
    });
  }

  else{
     jobId = await createBulkJob({
      tableName: "Projects",

      
      criteria: {
        group_operator: "and", // backend will check all
        group: criteriaGroup,
      },
      
      columns: [
        "Project_Name",
        "Status",
        "Start_Date",
        "End_Date",
        "Owner",
        "Assigned_To",
        "Assigned_To_Id",
        "Client_Name",
      ],
    });
  }

 

    dispatch(showSnackbar({ message: "Preparing Data ...", loading: true }));
     setFormData({
   selectedId: "",
    start_date: "",
    end_date: "",
    status :"",
  })
  setFilterBy("")
     
    pollJobStatus(jobId);
  } catch (err) {
    // console.log("aaba",err)
    dispatch(showSnackbar({ message: "Export failed!", loading: false }));
  }
};

  

  // Options depending on filterBy
  const renderOptions = () => {
    switch (filterBy) {
      case "Project":
        return projectData.map((p) => ({
          id: p.ROWID,
          label: p.Project_Name,
        }));
      case "User":
       const uniqueUsers = new Map();
  projectData.forEach((p) => {
    if (p.Assigned_To_Id) {
      uniqueUsers.set(p.Assigned_To_Id, {
        id: p.Assigned_To_Id,
        label: p.Assigned_To,
      });
    }
  });
  return Array.from(uniqueUsers.values());

      case "Status":
        return uniqueStatuses.map((s, idx) => ({
          id: s,
          label: s,
        }));
      default:
        return [];
    }
  };

  const handleCancel = () =>{
     toggleSheetDrawer(false);
     setFormData({
           selectedId: "",
    start_date: "",
    end_date: "",
    status :"",
     })
     setFilterBy("");
  }

  return (
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
              Export Projects
            </Typography>
          </Box>
          <Tooltip title="Close">
            <IconButton
              onClick={handleCancel}
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

        {/* Filter By */}
        <TextField
          label="Filter By"
          select
          fullWidth
          value={filterBy}
          onChange={(e) => {
            setFilterBy(e.target.value);
            setFormData({ selectedId: "", start_date: "", end_date: "" ,status: ""});
          }}
          sx={{ mb: 2 }}
        >
              <MenuItem value="Date">Date</MenuItem>
          <MenuItem value="Start Date">Start Date</MenuItem>
          <MenuItem value="End Date">End Date</MenuItem>
          <MenuItem value="Project">Project</MenuItem>
          
          <MenuItem value="User">User</MenuItem>
        
          <MenuItem value="Status">Status</MenuItem>
        </TextField>

        {/* Dynamic Fields */}
{["Project", "User", "Status"].includes(filterBy) && (
  <Autocomplete
    options={renderOptions()}
    getOptionLabel={(option) => option.label}
    value={
      filterBy === "Status"
        ? renderOptions().find((opt) => opt.id === formData.status) || null
        : renderOptions().find((opt) => opt.id === formData.selectedId) || null
    }
    onChange={(_, newValue) => {
      if (filterBy === "Status") {
        setFormData({ ...formData, status: newValue ? newValue.id : "" });
      } else {
        setFormData({ ...formData, selectedId: newValue ? newValue.id : "" });
      }
    }}
    renderInput={(params) => (
      <TextField {...params} label={`Select ${filterBy}`} />
    )}
    sx={{ mb: 2 }}
  />
)}

        {filterBy === "Start Date" && (
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
        )}

        {filterBy === "End Date" && (
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
        )}

        {filterBy === "Date" && (
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
          <Button variant="contained" color="primary" sx={{ width: 120 }}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ExportProject;
