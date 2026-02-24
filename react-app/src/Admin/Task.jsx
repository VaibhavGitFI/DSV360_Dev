import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableFooter,
  TablePagination,
  IconButton,
  Drawer,
  MenuItem,
  Modal,
  useTheme,
  Popover,
  Stack,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Autocomplete,
  alpha,
  Avatar,
  ListItemIcon,
  Divider,
  CircularProgress,
} from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import EventIcon from "@mui/icons-material/Event";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import CategoryIcon from "@mui/icons-material/Category";
import BusinessIcon from "@mui/icons-material/Business";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { FaTasks, FaUsers } from "react-icons/fa";
import axios from "axios";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Badge from "@mui/material/Badge";
import { TimeEntry } from "./TimeEntry";
import Slide from "@mui/material/Slide";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "../redux/Employee/EmployeeSlice";
import { fetchTasks, TaskActions } from "../redux/Tasks/TaskSlice";
import { useNavigate } from "react-router-dom";
import { fetchProjects } from "../redux/Project/ProjectSlice";
import { ExportTimeSheet } from "./ExportTimeSheet";

const statusOptions = ["Open", "Work In Process", "Completed"];


const statusConfig = {
  Open: {
    color: "#f0ad4e",
    backgroundColor: "#fff3cd",
    borderColor: "#ffeeba",
  },

  Completed: {
    color: "#198754",
    backgroundColor: "#d1e7dd",
    borderColor: "#badbcc",
  },
  "Work In Process": {
    color: "#0d6efd",
    backgroundColor: "#cfe2ff",
    borderColor: "#b6d4fe",
  },
};
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "success";
    case "work In Process":
      return "warning";
    case "open":
      return "error";
    case "delayed":
      return "error";
    default:
      return "default";
  }
};
function Task() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { projectId } = location.state || {};
  const { projectName } = location.state || {};
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewTask, setViewTask] = useState(null);
  const [assignOptions, setAssignOptions] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [attachementAnchorEl, setAttachementAnchorEL] = useState(null);

  const [currProject, setCurrProject] = useState({});
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [fileList, setFileList] = useState([]);
  const fileOpen = Boolean(anchorEl);
  const attachementOpen = Boolean(attachementAnchorEl);

  const [addLoading, setAddLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const[deleteLoading, setDeleteLoading] = useState(false);
const [highlightedTaskId, setHighlightedTaskId] = useState(null);
  const [sheetDrawer, setSheetDrawer] = useState(false);


  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [newTask, setNewTask] = useState({
    projectId: projectId || "",
    project_name: projectName || "",
    name: "",
    assignTo: "",
    assignToID: "",
    status: "",
    startDate: "",
    endDate: "",
    description: "",
    type: "",
  });

  const [TaskName, setTaskName] = useState("");
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [taskDetail, setTaskDetail] = useState(null);
  const { data } = useSelector((state) => state.projectReducer);
  const { data: employeedata } = useSelector((state) => state.employeeReducer);
  const { data: tasksData, isLoading } = useSelector(
    (state) => state.taskReducer
  );
  

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewURLs, setPreviewURLs] = useState([]);

  useEffect(() => {
    const fetchTasksData = async () => {
      try {
        // Fetch tasks by projectId if it's available
        if (projectId) {
          const taskProject = data.find(
            (project) => project.ROWID === projectId
          );
          // console.log("hihihihih", taskProject);
          setCurrProject(taskProject);

          const res = await axios.post(
            "/server/time_entry_management_application_function/tasks/project",
               {
         "projectID": projectId
          }
            
          );
          // console.log("taskres", res);
          setTasks(res.data.data);
        } else {
          // If Task data is not already in Redux, fetch it
          if (!Array.isArray(tasksData) || tasksData.length === 0) {
            const response = await dispatch(fetchTasks()).unwrap();

            setTasks(response);
          } else {
            // Use existing Task data from Redux
            setTasks(tasksData);
          }
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    // Check and fetch employee and project data only if needed
    if (!Array.isArray(employeedata) || employeedata.length === 0) {
      dispatch(fetchEmployees());
    }

    if (!Array.isArray(data) || data.length === 0) {
      dispatch(fetchProjects());
    }

    fetchTasksData();
  }, [projectId, dispatch]);

  useEffect(() => {
    if (employeedata) {
      // Check if employeedata is available before filtering
      const employee = employeedata
        ?.filter(
          (employee) =>
            employee.role_details.role_name !== "Contacts" &&
            employee.role_details.role_name !== "Super Admin"
        )
        ?.map((employee) => ({
          username: `${employee.first_name} ${employee.last_name}`,
          userID: employee.user_id,
          role: employee.role_details.role_name,
        }));
      // console.log("employee", employee);
      setAssignOptions(employee);

      if (projectId) {
        setTaskName(projectName);
      } else {
        setTaskName("Tasks");
        setTasks(tasksData);
      }
    }
  }, [employeedata, tasksData]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);

    // Prevent duplicates by file name (optional)
    const filteredNewFiles = newFiles.filter(
      (newFile) => !selectedFiles.some((file) => file.name === newFile.name)
    );

    const updatedFiles = [...selectedFiles, ...filteredNewFiles];
    setSelectedFiles(updatedFiles);

    const newPreviews = filteredNewFiles?.map((file) =>
      file.type.startsWith("image/") ? URL.createObjectURL(file) : null
    );
    setPreviewURLs((prev) => [...prev, ...newPreviews]);

    // Reset input value to allow selecting the same file again if needed
    e.target.value = "";
  };
  const handleAttachementOpen = (e, filesString) => {
    e.stopPropagation();
    setAttachementAnchorEL(e.currentTarget);

    const files = (filesString || "")?.split(",")
      ?.map((url) => url.trim())
      .filter(Boolean);

    setFileList(files);
  };

  const handleAttachementClose = (e) => {
    e.stopPropagation();
    setAttachementAnchorEL(null);
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);

    const updatedPreviews = [...previewURLs];
    updatedPreviews.splice(index, 1);
    setPreviewURLs(updatedPreviews);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredTasks = tasks?.filter((task) =>
    task?.Task_Name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedTasks = filteredTasks?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const validateForm = () => {
    let newErrors = {};

    // console.log("huhuh", newTask);

    if (!newTask.projectId) newErrors.projectId = "Project is required";
    if (!newTask.name) newErrors.name = "Task name is required";
    if (!newTask.assignToID)
      newErrors.assignToID = "At least one user must be assigned";
    if (!newTask.status) newErrors.status = "Status is required";
    if (!newTask.startDate) newErrors.startDate = "Start date is required";
    if (!newTask.endDate) newErrors.endDate = "End date is required";

    if (newTask.startDate && newTask.endDate) {
      if (newTask.startDate > newTask.endDate) {
        newErrors.endDate = "Task end date cannot be before start date";
      }
    }

    if (newTask.startDate) {
      if (
        currProject.Start_Date &&
        newTask.startDate < currProject.Start_Date
      ) {
        newErrors.startDate =
          "Task start date cannot be before project start date";
      } else if (
        currProject.End_Date &&
        newTask.startDate > currProject.End_Date
      ) {
        newErrors.startDate =
          "Task start date cannot be after project end date";
      }
    }

    if (newTask.endDate) {
      if (currProject.Start_Date && newTask.endDate < currProject.Start_Date) {
        newErrors.endDate = "Task end date cannot be before project start date";
      } else if (
        currProject.End_Date &&
        newTask.endDate > currProject.End_Date
      ) {
        newErrors.endDate = "Task end date cannot be after project end date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEditTaskForm = () => {
    const newErrors = {};

    // Basic field validations
    if (!currentTask.Task_Name) newErrors.Task_Name = "Task name is required";
    if (!currentTask.ProjectID) newErrors.ProjectID = "Project is required";
    if (!currentTask.Assign_To_ID || currentTask.Assign_To_ID === "")
      newErrors.Assign_To_ID = "At least one user must be assigned";
    if (!currentTask.Status) newErrors.Status = "Status is required";
    if (!currentTask.Start_Date)
      newErrors.Start_Date = "Start date is required";
    if (!currentTask.End_Date) newErrors.End_Date = "End date is required";

    // Project date range validation
    const taskProject = data.find(
      (project) => project.ROWID === currentTask.ProjectID
    );

    if (taskProject && currentTask.Start_Date && currentTask.End_Date) {
      const projectStart = new Date(taskProject.Start_Date);
      const projectEnd = new Date(taskProject.End_Date);
      const taskStart = new Date(currentTask.Start_Date);
      const taskEnd = new Date(currentTask.End_Date);

      if (taskStart < projectStart || taskStart > projectEnd) {
        newErrors.Start_Date = `Start date must be within the project range: ${taskProject.Start_Date} to ${taskProject.End_Date}`;
      }

      if (taskEnd < projectStart || taskEnd > projectEnd) {
        newErrors.End_Date = `End date must be within the project range: ${taskProject.Start_Date} to ${taskProject.End_Date}`;
      }

      if (taskEnd < taskStart) {
        newErrors.End_Date = "End date cannot be earlier than start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
  

    if (name === "projectId") {
      const selectedOption = data.find((option) => option.ROWID === value);
      if (selectedOption) {
        setNewTask((prev) => ({
          ...prev,
          project_name: selectedOption.Project_Name,
          projectId: selectedOption.ROWID,
        }));
      }
    } else if (name === "assignToID") {
      //  Ensure value is always an array
      const selectedValues = Array.isArray(value) ? value : value?.split(",");

      const selectedUsernames = selectedValues
        ?.map((id) => {
          const user = assignOptions.find((option) => option.userID === id);
          return user ? user.username : "";
        })
        ?.filter(Boolean) // Remove empty names
        .join(", ");

      setNewTask((prev) => ({
        ...prev,
        assignTo: selectedUsernames, // Store names
        assignToID: selectedValues.join(","), //  Store IDs
      }));
    } else {
      setNewTask((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAlert = (severity, message) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  function SlideTransition(props) {
    return <Slide {...props} direction="down" />;
  }

  const handleAddTask = async () => {
    try {
      setAddLoading(true);
      const formData = new FormData();

      // Append selected files
      selectedFiles.forEach((file) => {
        // console.log(file);
        formData.append("files", file);
      });

      // Ensure assignToID is a comma-separated string
      const assignToID = Array.isArray(newTask.assignToID)
        ? newTask.assignToID.join(",")
        : newTask.assignToID;

      const assignTo = Array.isArray(newTask.assignTo)
        ? newTask.assignTo.join(",")
        : newTask.assignTo;

      // Append all task fields
      formData.append("Status", newTask.status);
      formData.append("Description", newTask.description);
      formData.append("Assign_To", assignTo);
      formData.append("Assign_To_ID", assignToID);
      formData.append("ProjectID", newTask.projectId);
      formData.append("Project_Name", newTask.project_name);
      formData.append("Task_Name", newTask.name);
      formData.append("Start_Date", newTask.startDate);
      formData.append("End_Date", newTask.endDate);
      formData.append("Type", newTask.type);

      const response = await axios.post(
        "/server/time_entry_management_application_function/tasks",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const result = response.data;

      if (result.success) {
        handleCancel(); // Clear UI, close forms etc.
        handleAlert("success", "Task added successfully");
        dispatch(TaskActions.addTaskData(result.data));

         setHighlightedTaskId(result.data.ROWID);
        setTimeout(() => setHighlightedTaskId(null), 5000); 

        if (projectId && newTask.projectId === projectId) {
          setTasks((prev) => [...prev, result.data]);
        }

        // Clear form and file input
        setSelectedFiles([]);
        setNewTask({
          name: "",
          status: "",
          description: "",
          assignTo: [],
          assignToID: [],
          projectId: "",
          project_name: "",
          startDate: "",
          endDate: "",
          type: "",
        });
      } else {
        handleAlert("error", result.message || "Failed to add task");
      }
    } catch (error) {
      handleAlert("error", error.message || "Error adding task");
    }finally{
      setAddLoading(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    setNewTask({
      projectId: projectId || "",
      project_name: projectName || "",
      name: "",
      assignTo: "",
      assignToID: "",
      status: "",
      startDate: "",
      endDate: "",
      description: "",
    });
    toggleDrawer(false);
  };

  const handleEdit = (task) => {
    // console.log("task data", task);
    setCurrentTask(task);
    setEditModalOpen(true);
  };

  const handleUpdateTask = async () => {
    // console.log("gogogo", currentTask);
    if (!validateEditTaskForm()) return;

    try {
      setUpdateLoading(true);
      const ROWID = currentTask.ROWID;
      // Ensure assignToID is properly formatted as a string
      const Assign_To_ID = Array.isArray(currentTask.Assign_To_ID)
        ? currentTask.Assign_To_ID.join(",")
        : currentTask.Assign_To_ID;

      const updateResponse = await axios.post(
        `/server/time_entry_management_application_function/tasks/${ROWID}`,
        currentTask
      );
      // console.log("updated", updateResponse);
      if (updateResponse.status === 200) {
        dispatch(TaskActions.updateTaskData(updateResponse.data.data));
        setCurrentTask(null);
        setEditModalOpen(false);
        handleAlert("success", "Task updated successfully");
        if (projectId && currentTask.ProjectID === projectId) {
          const updatedTasksData = tasks?.map((item) =>
            item.ROWID === ROWID ? updateResponse.data.data : item
          );
          setTasks(updatedTasksData);
        }
      } else {
        handleAlert("error", "Failed to update task");
      }
    } catch (error) {
      handleAlert("error", error.message || "Error updating task");
    }finally{
      setUpdateLoading(false);
    }
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;

    // console.log("gigig", name, value);

    if (name === "Project_Name") {
      const selectedOption = data.find((option) => option.ROWID === value);

      if (selectedOption) {
        setCurrentTask((prev) => ({
          ...prev,
          Project_Name: selectedOption.Project_Name,
          ProjectID: selectedOption.ROWID,
        }));
      }
    } else if (name === "Assign_To") {
      // Handle multiple selections
      const selectedValues = event.target.value;
      const selectedUsernames = selectedValues
        ?.map((id) => {
          const user = assignOptions?.find((option) => option.userID === id);
          return user ? user.username : "";
        })
        ?.filter((name) => name)
        .join(", ");

      setCurrentTask((prev) => ({
        ...prev,
        Assign_To: selectedUsernames,
        Assign_To_ID: selectedValues.join(","),
      }));
    } else {
      setCurrentTask((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCloseEditModal = () => {
    setErrors({});
    setEditModalOpen(false);
  };

  const handleViewTask = (e, task) => {
    e.stopPropagation();
    setViewTask(task);
    // setViewModalOpen(true);

    navigate("/TimeEntry/" + task.ROWID, { state: { task } });
  };

  const handleCloseViewModal = () => {
    setViewTask(null);
    setViewModalOpen(false);
  };

  const handleAssigneeClick = (event, assignees) => {
    setSelectedAssignees(assignees?.split(",")?.map((name) => name.trim()));
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (taskToDelete) {
      try {
        setDeleteLoading(true)
        const response = await axios.delete(
          `/server/time_entry_management_application_function/tasks/${taskToDelete.ROWID}`
        );
        if (response.status === 200) {
          dispatch(TaskActions.deleteTasktData(taskToDelete.ROWID));
          handleAlert("success", "Task deleted successfully");
          setTasks((prev) =>
            prev.filter((item) => item.ROWID !== taskToDelete.ROWID)
          );
        } else {
          handleAlert("error", "Failed to delete task");
        }
      } catch (error) {
        handleAlert("error", error.message || "Error deleting task");
      } finally {
        setDeleteConfirmOpen(false);
        setTaskToDelete(null);
        setDeleteLoading(false);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setTaskToDelete(null);
  };

  const handleSubmit = () => {
    if (validateForm()) {
      handleAddTask();
    }
  };

  const handleDetailDrwaer = (e, task) => {
    setOpen(true);
    setTaskDetail(task);
  };

  const fields = [
    [
      "Task ID",
      "T" + taskDetail?.ROWID?.slice(-4),
      <AssignmentIcon color="primary" />,
    ],
    ["Task Name", taskDetail?.Task_Name, <DescriptionIcon color="primary" />],
    ["Assigned To", taskDetail?.Assign_To, <PersonIcon color="primary" />],
    [
      "Project Name",
      taskDetail?.Project_Name,
      <BusinessIcon color="primary" />,
    ],
    ["Start Date", new Date(taskDetail?.Start_Date).toLocaleDateString("en-GB"), <EventIcon color="primary" />],
    ["End Date", new Date(taskDetail?.End_Date).toLocaleDateString("en-GB"), <ScheduleIcon color="primary" />],
    ["Status", taskDetail?.Status, <TrackChangesIcon color="primary" />],
    //["Type", taskDetail?.Type, <MonetizationOnIcon color="primary" />],
    [
      "Description",
      taskDetail?.Description,
      <DescriptionIcon color="primary" />,
    ],
  ];

  const handleClose = () => {
    setOpen(false);
  };

  
const toggleSheetDrawer = (open) => {
    setSheetDrawer(open);
  };  

  return (
    <Box sx={{ padding: 3 }}>
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
        {/* Left Side: Avatar + Typography */}
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
            <AssignmentIcon sx={{ color: "#fff" }} fontSize="large" />
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
            Tasks
          </Typography>
        </Box>

        {/* Right Side: Search Bar + Button */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            width: { xs: "100%", md: "auto" },
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <TextField
            label="Search Tasks"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            sx={{
              width: { xs: "100%", sm: "60%", md: "250px" },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => toggleDrawer(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Add Task
          </Button>
            <Button
                      variant="contained"
                      color="primary"
                     
                      onClick={() => toggleSheetDrawer(true)}
                      sx={{ width: { xs: "100%", sm: "auto" } }}
                      
                    >
                      Export Time Sheet
                    </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={12}>
          {isLoading ? (
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                  }}
                >
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Task ID
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Task Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Project Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Start Date
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    End Date
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Description
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "300px",
                        gap: 2,
                      }}
                    >
                      {[...Array(6)]?.map((_, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            width: "100%",
                            height: "40px",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Skeleton variant="text" width="8%" />
                          <Skeleton variant="text" width="15%" />
                          <Skeleton variant="text" width="10%" />
                          <Skeleton variant="text" width="12%" />
                          <Skeleton variant="text" width="15%" />
                          <Skeleton variant="text" width="12%" />
                          <Skeleton variant="text" width="12%" />
                          <Skeleton variant="text" width="8%" />
                          <Skeleton variant="text" width="8%" />
                        </Box>
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : paginatedTasks.length === 0 ? (
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                  }}
                >
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Task ID
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Task Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Project Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Associated
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Start Date
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    End Date
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Actions
                  </TableCell>

                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Time
                  </TableCell>
                </TableRow>
              </TableHead>
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
                      <FaTasks size={50} color={theme.palette.text.secondary} />
                      <Typography variant="h5" color="text.secondary">
                        No Tasks Found
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        There are no tasks to display.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                    }}
                  >
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Task ID
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Task Name
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Project Name
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Associated
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Start Date
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      End Date
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Actions
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Attachements
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Time Entry
                    </TableCell>
                  </TableRow>
                </TableHead>
                {loading ? (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "300px",
                            gap: 2,
                          }}
                        >
                          {[...Array(6)]?.map((_, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                width: "100%",
                                height: "40px",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Skeleton variant="text" width="8%" />
                              <Skeleton variant="text" width="15%" />
                              <Skeleton variant="text" width="10%" />
                              <Skeleton variant="text" width="12%" />
                              <Skeleton variant="text" width="15%" />
                              <Skeleton variant="text" width="12%" />
                              <Skeleton variant="text" width="12%" />
                              <Skeleton variant="text" width="8%" />
                              <Skeleton variant="text" width="8%" />
                            </Box>
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                ) : paginatedTasks.length === 0 ? (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={9} sx={{ p: 0 }}>
                        <Box
                          sx={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            p: 2,
                          }}
                        >
                          {[...Array(6)]?.map((_, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                width: "100%",
                                height: "40px",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Skeleton variant="text" width="8%" />{" "}
                              {/* Task ID */}
                              <Skeleton variant="text" width="15%" />{" "}
                              {/* Task Name */}
                              <Skeleton variant="text" width="15%" />{" "}
                              {/* Project Name */}
                              <Skeleton variant="text" width="12%" />{" "}
                              {/* Associated */}
                              <Skeleton variant="text" width="10%" />{" "}
                              {/* Status */}
                              <Skeleton variant="text" width="12%" />{" "}
                              {/* Start Date */}
                              <Skeleton variant="text" width="12%" />{" "}
                              {/* End Date */}
                              <Skeleton variant="text" width="8%" />{" "}
                              {/* Actions */}
                              <Skeleton variant="text" width="8%" />{" "}
                              {/* Time Entry */}
                            </Box>
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                ) : (
                  <TableBody>
                    {paginatedTasks?.map((task) => (
                      <TableRow
                        key={task.id}
                        onClick={(e) => handleDetailDrwaer(e, task)}
                        // sx={{
                        //   cursor: "pointer",
                        //   "&:hover": {
                        //     backgroundColor:
                        //       theme.palette.mode === "light"
                        //         ? "#e3f2fd"
                        //         : theme.palette.primary.dark,
                        //     color: theme.palette.primary.contrastText,
                        //   },
                        // }}

                         sx={{
      cursor: "pointer",
      backgroundColor:
        highlightedTaskId === task.ROWID
          ? theme.palette.mode === "light"
            ? "#e3f2fd" // same as hover in light mode
            : theme.palette.primary.dark // same as hover in dark mode
          : "inherit",
      color:
        highlightedTaskId === task.ROWID
          ? theme.palette.primary.contrastText
          : "inherit",
      "&:hover": {
        backgroundColor:
          theme.palette.mode === "light"
            ? "#e3f2fd"
            : theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
      },
      transition: "background-color 0.3s ease",
    }}
                      >
                          
                        <TableCell>
                          {"T" + task.ROWID.substr(task.ROWID.length - 4)}
                        </TableCell>
               <TableCell
  sx={{
    maxWidth: 100, // adjust width as needed
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }}
>
  <Tooltip title={task?.Task_Name} arrow>
    <Typography
      variant="body2"
      sx={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {task?.Task_Name}
    </Typography>
  </Tooltip>
</TableCell>
                        <TableCell>{task.Project_Name}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Tooltip title="View Assignees">
                            <IconButton
                              size="small"
                              onClick={(e) =>
                                handleAssigneeClick(e, task.Assign_To)
                              }
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <FaUsers />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {task.Assign_To?.split(",").length}
                              </Typography>
                            </IconButton>
                          </Tooltip>

                          <Popover
                            open={Boolean(anchorEl)}
                            anchorEl={anchorEl}
                            onClose={handleClosePopover}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "left",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "left",
                            }}
                          >
                            <List
                              sx={{
                                minWidth: 200,
                                maxWidth: 300,
                                p: 1,
                                bgcolor: theme.palette.background.paper,
                                boxShadow: theme.shadows[2],
                                borderRadius: 1,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  px: 2,
                                  py: 1,
                                  color: theme.palette.text.secondary,
                                  borderBottom: `1px solid ${theme.palette.divider}`,
                                }}
                              >
                                Assigned Users
                              </Typography>
                              {selectedAssignees?.map((assignee, index) => (
                                <ListItem key={index} sx={{ py: 0.5 }}>
                                  <ListItemText
                                    primary={assignee}
                                    primaryTypographyProps={{
                                      variant: "body2",
                                    }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Popover>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={task.Status}
                            size="small"
                            sx={{
                              backgroundColor:
                                statusConfig[task.Status]?.backgroundColor ||
                                "#f5f5f5",
                              color:
                                statusConfig[task.Status]?.color || "#757575",
                              border: `1px solid ${statusConfig[task.Status]?.borderColor || "#e0e0e0"}`,
                              fontWeight: 500,
                              fontSize: "0.75rem",
                              height: "24px",
                              "& .MuiChip-label": {
                                px: 1,
                              },
                              // minWidth: 110,
                              // height: 28,
                              // borderRadius: "14px",
                              // "&:hover": {
                              //   backgroundColor:
                              //     statusConfig[task.Status]?.backgroundColor ||
                              //     "#f5f5f5",
                              //   opacity: 0.9,
                              // },
                            }}
                          />
                        </TableCell>
                        <TableCell>{new Date (task.Start_Date).toLocaleDateString("en-GB")}</TableCell>
                        <TableCell>{new Date(task.End_Date).toLocaleDateString("en-GB")}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(task)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(task)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>

                        <TableCell>
                          <Tooltip    title={
      task.Files && task.Files.trim() !== ""
        ? "View Attachments"
        : "No Attachments"
    }
>
                            <IconButton
                              onClick={(e) =>
                                handleAttachementOpen(e, task.Files)
                              }
                            >
                              <Badge
                                badgeContent={
                                  task.Files
                                    ? task.Files?.split(",").filter(
                                      (file) => file.trim() !== ""
                                    ).length
                                    : 0
                                }
                                color="primary"
                                overlap="circular"
                              >
                                <AttachFileIcon
                                  fontSize="large"
                                  sx={{
                                    color: "#1976d2",
                                    fontSize: 30,
                                    cursor: "pointer",
                                  }}
                                />
                              </Badge>
                            </IconButton>
                          </Tooltip>


                          <Popover
                            open={Boolean(attachementAnchorEl)}
                            anchorEl={attachementAnchorEl}
                            onClose={handleAttachementClose}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "left",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "left",
                            }}
                            PaperProps={{
                              sx: {
                                padding: 1,
                                minWidth: 200,
                                maxWidth: 300,
                              },
                            }}
                          >
                            <List dense>
                              {fileList.length > 0 ? (
                                fileList?.map((url, index) => (
                                  <ListItem
                                    key={`${url}-${index}`}
                                    component="a"
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDrawerOpen(false);
                                    }}
                                    sx={{
                                      textDecoration: "none",
                                      "&:hover": {
                                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                                      },
                                    }}
                                  >
                                    <ListItemIcon
                                      sx={{ minWidth: 30, marginRight: 1 }}
                                    >
                                      <InsertDriveFileIcon color="action" />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={`File ${index + 1}`}
                                      sx={{
                                        color: "#1976d2",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    />
                                  </ListItem>
                                ))
                              ) : (
                                <ListItem>
                                  <ListItemText
                                    primary="No attachments available"
                                    sx={{
                                      color: "text.secondary",
                                      fontStyle: "italic",
                                    }}
                                  />
                                </ListItem>
                              )}
                            </List>
                          </Popover>
                        </TableCell>

                        <TableCell>
                          <AccessTimeIcon
                            fontSize="large" // Use 'small', 'medium', 'large', or set via style
                            style={{
                              color: theme.palette.primary.main,
                              fontSize: 30, // You can increase this number as needed (e.g., 36, 40)
                              cursor: "pointer",
                            }}
                            onClick={(e) => handleViewTask(e, task)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                )}
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 20]}
                      count={filteredTasks.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCancel}
      >
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              px: 2,
              py: 1.5,
              borderRadius: 2,
              marginBottom: 2,
               backgroundColor: theme.palette.primary.main,
              boxShadow: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", color: "#fff" }}>
              <PlaylistAddCheckIcon sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Add New Task
              </Typography>
            </Box>
            <Tooltip title="Close">
              <IconButton
                onClick={handleCancel}
                sx={{
                  color: "#fff",
                  transition: "transform 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.2)",
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Autocomplete
            options={data}
            getOptionLabel={(option) => option.Project_Name}
            isOptionEqualToValue={(option, value) =>
              option.ROWID === value.ROWID
            }
            value={
              projectName
                ? data.find((option) => option.Project_Name === projectName)
                : data.find((option) => option.ROWID === newTask.projectId) ||
                null
            }
            onChange={(event, newValue) => {
              if (!projectName) {
                setCurrProject(newValue);

                handleInputChange({
                  target: {
                    name: "projectId",
                    value: newValue ? newValue.ROWID : "",
                  },
                });
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Add Project"
                name="projectId"
                fullWidth
                variant="outlined"
                sx={{ marginBottom: 2 }}
                error={!!errors.projectId}
                helperText={errors.projectId}
              />
            )}
            disabled={!!projectName}
          />

          <TextField
            label="Add Task"
            name="name"
            fullWidth
            value={newTask.name}
            onChange={handleInputChange}
            sx={{ marginBottom: 2 }}
            error={!!errors.name}
            helperText={errors.name}
          />

          <Autocomplete
            multiple
            options={assignOptions}
            getOptionLabel={(option) => option.username}
            value={assignOptions.filter((option) =>
              Array.isArray(newTask.assignToID)
                ? newTask.assignToID.includes(option.userID)
                : typeof newTask.assignToID === "string"
                  ? newTask.assignToID?.split(",").includes(option.userID)
                  : []
            )}
            onChange={(event, newValue) => {
              const selectedValues = Array.isArray(newValue) ? newValue : [];
              const selectedIDs = selectedValues?.map((option) => option.userID);

              handleInputChange({
                target: {
                  name: "assignToID",
                  value: selectedIDs.length > 0 ? selectedIDs.join(",") : "", // Convert to a string
                },
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Associated"
                name="assignToID"
                fullWidth
                error={!!errors.assignToID}
                helperText={errors.assignToID}
                sx={{ marginBottom: 2 }}
              />
            )}
          />

          <TextField
            select
            fullWidth
            label="Status"
            name="status"
            value={newTask.status}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            error={!!errors.status}
            helperText={errors.status}
          >
            {Object.keys(statusConfig)?.map((status) => (
              <MenuItem
                key={status}
                value={status}
                sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}
              >
                <Box
                  component={statusConfig[status].icon}
                  sx={{ color: statusConfig[status].color, fontSize: "1.1rem" }}
                />
                <Typography
                  sx={{ color: statusConfig[status].color, fontWeight: 500 }}
                >
                  {status}
                </Typography>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Start Date"
            name="startDate"
            fullWidth
            type="date"
            value={newTask.startDate}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            sx={{ marginBottom: 2 }}
            error={!!errors.startDate}
            helperText={errors.startDate}
          />

          <TextField
            label="End Date"
            name="endDate"
            fullWidth
            type="date"
            value={newTask.endDate}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            sx={{ marginBottom: 2 }}
            error={!!errors.endDate}
            helperText={errors.endDate}
          />

          <TextField
            label="Add Description"
            name="description"
            fullWidth
            multiline
            rows={4}
            value={newTask.description}
            onChange={handleInputChange}
            sx={{ marginBottom: 3 }}
          />

          <Box sx={{ marginBottom: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<AttachFileIcon />}
              sx={{ marginBottom: 1 }}
            >
              Add Attachment
              <input
                type="file"
                hidden
                accept="image/*,application/pdf"
                multiple
                onChange={handleFileChange} // Your file handler
              />
            </Button>

            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {selectedFiles?.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                      p: 1,
                      border: "1px solid #ccc",
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      {file.type.startsWith("image/") && previewURLs[index] ? (
                        <img
                          src={previewURLs[index]}
                          alt={file.name}
                          style={{
                            width: 50,
                            height: 50,
                            objectFit: "cover",
                            borderRadius: 4,
                          }}
                        />
                      ) : (
                        <DescriptionIcon sx={{ fontSize: 30 }} />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {file.name}
                      </Typography>
                    </Box>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveFile(index)} // Your remove function
                      size="small"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{ width: 100 }}
                disabled={addLoading}
            >
             {addLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Add"
                  )}
            </Button>
            <Button variant="outlined" color="error" onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Modal open={editModalOpen} onClose={handleCloseEditModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "40%",
            maxHeight: "100vh",
            overflowY: "auto",
            padding: 4,
            backgroundColor: (theme) => theme.palette.background.paper,
            boxShadow: 24,
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" color={theme.palette.text.primary} sx={{ marginBottom: 2 }}>
            Edit Task
          </Typography>

          {currentTask && (
            <>
              <TextField
                label="Task Name"
                name="Task_Name"
                fullWidth
                variant="outlined"
                value={currentTask.Task_Name}
                onChange={handleEditInputChange}
                error={!!errors.Task_Name}
                helperText={errors.Task_Name}
                sx={{ marginBottom: 2 }}
              />

              <TextField
                label="Project"
                name="Project_Name"
                fullWidth
                select
                variant="outlined"
                value={currentTask.ProjectID || ""}
                onChange={handleEditInputChange}
                error={!!errors.ProjectID}
                helperText={errors.ProjectID}
                sx={{ marginBottom: 2 }}
              >
                {data?.map((option) => (
                  <MenuItem key={option.ROWID} value={option.ROWID}>
                    {option.Project_Name}
                  </MenuItem>
                ))}
              </TextField>

              <Autocomplete
                multiple
                fullWidth
                options={assignOptions}
                getOptionLabel={(option) => option.username}
                value={assignOptions.filter((opt) =>
                  currentTask.Assign_To_ID
                    ? currentTask.Assign_To_ID.includes(opt.userID)
                    : typeof currentTask.Assign_To_ID === "string"
                      ? currentTask.Assign_To_ID?.split(",").includes(opt.userID)
                      : []
                )}
                onChange={(event, newValue) => {
                  const selectedIDs = newValue?.map((item) => item.userID);
                  const selectedNames = newValue?.map((item) => item.username);

                  setCurrentTask((prev) => ({
                    ...prev,
                    Assign_To_ID: selectedIDs.join(","),
                    Assign_To: selectedNames.join(", "),
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Associated"
                    name="Assign_To"
                    variant="outlined"
                    sx={{ marginBottom: 2 }}
                  />
                )}
              />

              <TextField
                select
                fullWidth
                label="Status"
                name="Status"
                value={currentTask.Status}
                onChange={handleEditInputChange}
                error={!!errors.Status}
                helperText={errors.Status}
                sx={{ marginBottom: 2 }}
              >
                {Object.keys(statusConfig)?.map((Status) => (
                  <MenuItem key={Status} value={Status}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        component={statusConfig[Status].icon}
                        sx={{
                          color: statusConfig[Status].color,
                          fontSize: "1.1rem",
                        }}
                      />
                      <Typography
                        sx={{
                          color: statusConfig[Status].color,
                          fontWeight: 500,
                        }}
                      >
                        {Status}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Start Date"
                name="Start_Date"
                type="date"
                fullWidth
                variant="outlined"
                value={currentTask.Start_Date}
                onChange={handleEditInputChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.Start_Date}
                helperText={errors.Start_Date}
                sx={{ marginBottom: 2 }}
              />

              <TextField
                label="End Date"
                name="End_Date"
                type="date"
                fullWidth
                variant="outlined"
                value={currentTask.End_Date}
                onChange={handleEditInputChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.End_Date}
                helperText={errors.End_Date}
                sx={{ marginBottom: 2 }}
              />

              <TextField
                label="Add Description"
                name="Description"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={currentTask.Description}
                onChange={handleEditInputChange}
                error={!!errors.Description}
                helperText={errors.Description}
                sx={{ marginBottom: 2 }}
              />
            </>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 3,
            }}
          >
            <Button variant="contained" color="primary" onClick={handleUpdateTask} disabled={updateLoading}>
              {updateLoading ? (
                     <CircularProgress size={24} color="inherit" />
                   ) : (
                     "Update"
                   )}
            </Button>
            <Button variant="outlined" color="error" onClick={handleCloseEditModal}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>


      {/* time entry */}
      {viewTask ? (
        <TimeEntry
          theme={theme}
          handleEditInputChange={handleEditInputChange}
          projects={data}
          statusOptions={statusOptions}
          handleUpdateTask={handleUpdateTask}
          viewModalOpen={viewModalOpen}
          viewTask={viewTask}
          setViewTask={setViewTask}
          handleCloseViewModal={handleCloseViewModal}
        />
      ) : (
        <div></div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete task "{taskToDelete?.Task_Name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
              disabled={deleteLoading}

          >
             {deleteLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Delete"
                )}
          </Button>
        </DialogActions>
      </Dialog>

      <Drawer anchor="right" open={open} onClose={handleClose}>
        <Box
          sx={{
            width: 420,
            mt: "65px",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Box
            sx={{
              backgroundColor: "primary.main",
              color: "#fff",
              px: 3,
              py: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "sticky",
              top: 0,
              zIndex: 1,
            }}
          >
            <Typography variant="h6">Task Details</Typography>
            <IconButton onClick={handleClose} sx={{ color: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {isLoading ? (
            <Box px={3} py={2}>
              <Typography>Loading task details...</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {fields?.map(([label, value, icon], index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{ px: 3, py: 1.5 }}>
                    <ListItemIcon sx={{ color: "primary.main" }}>
                      {icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight="bold">
                          {label}
                        </Typography>
                      }
                      secondary={
                        label === "Status" ? (
                          <Chip
                            label={value}
                            color={getStatusColor(value)}
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        ) : (
                          <Typography
                            color="text.secondary"
                            sx={{
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                            }}
                          >
                            {value}
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                  {index !== fields.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={SlideTransition}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            "&.MuiAlert-standardSuccess": {
              backgroundColor: "#4caf50",
              color: "#fff",
            },
            "&.MuiAlert-standardError": {
              backgroundColor: "#f44336",
              color: "#fff",
            },
            "& .MuiAlert-icon": {
              color: "#fff",
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

     <ExportTimeSheet open = {sheetDrawer} toggleSheetDrawer={toggleSheetDrawer} />
      
    </Box>
  );
}

export default Task;
